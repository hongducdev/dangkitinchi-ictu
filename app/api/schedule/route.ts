import * as cookie from "cookie";
import puppeteer from "puppeteer";

const urlSchedule =
  "http://220.231.119.171/kcntt/Reports/Form/StudentTimeTable.aspx";

function extractTimeAndRoom(htmlTime, htmlRoom) {
  const regexTime =
    /Từ (.*?) đến (.*?): <b>\((\d+)\)<\/b><br>&nbsp;&nbsp;&nbsp;<b>(.*?)<\/b>/g;
  const regexRoom = /(<b>\((\d+)(,\d+){0,}\)<\/b><br>(.*?))/g;
  const matchesTime = [...htmlTime.matchAll(regexTime)];

  let template = htmlRoom.split(regexRoom);
  // index % 5 == 1 => (1,2,3,...)
  // index % 5 == 5 && index > 0 => roomName
  template = template.filter((_, i) => (i > 0 && i % 5 == 0) || i % 5 == 1);
  // chunk array
  function chunk(array, chunkSize) {
    return [].concat.apply(
      [],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  }
  template = chunk(template, 2);
  const hashmap = {
    // [index]: [roomname]
  };
  for (const [a, b] of template) {
    /\((\d+)(,\d+){0,}\)/g
      .exec(a)[0]
      .replace(/[\(|\)]/g, "")
      .split(",")
      .map((_) => (hashmap[_] = b.trim().replace(/<br>/g, "")));
  }
  const result = [];
  for (let i = 0; i < matchesTime.length; i++) {
    // [matchString, start, end, index, extra]
    const timeMatch = matchesTime[i] || [, , , ,];
    const [, startTime, endTime, sessionNumber, roomInfo] = timeMatch;
    const room = hashmap[sessionNumber];
    result.push({ startTime, endTime, sessionNumber, roomInfo, room });
  }
  return result;
}



export const GET = async (request: Request) => {
  const newBrowser = await puppeteer.launch();
  const page = await newBrowser.newPage();

  // get cookie
  const cookieString = request.headers.get("cookie");

  if (cookieString) {
    const cookies = Object.entries(cookie.parse(cookieString)).map(
      ([name, value]) => ({ name, value })
    );

    // Set cookies
    await page.setCookie({
      name: cookies[0].name,
      value: cookies[0].value,
      domain: "220.231.119.171",
    });

    // Navigate to the desired URL
    await page.goto(urlSchedule);

    // Wait for the table to be present on the page
    await page.waitForSelector("#gridRegistered");

    const data = [];
    const rows = await page.$$("#gridRegistered tr");

    for (const row of rows) {
      const columns = await row.$$("td");

      const timeHtml =
        (await await columns[3]?.evaluate((node) => node.innerHTML)) || "";
      const roomHtml =
        (await await columns[4]?.evaluate((node) => node.innerHTML)) || "";

      const timeInfo = extractTimeAndRoom(timeHtml, roomHtml);

      data.push({
        STT: (
          await(
            await columns[0]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        TenMonHoc: (
          await(
            await columns[1]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        MaMonHoc: (
          await(
            await columns[2]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        ThoiGian: timeInfo,
        GiaoVien: (
          await(
            await columns[5]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        SiSo: (
          await(
            await columns[6]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        SoDangKy: (
          await(
            await columns[7]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        SoTinChi: (
          await(
            await columns[8]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        HocPhi: (
          await(
            await columns[9]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
        GhiChu: (
          await(
            await columns[10]?.getProperty("textContent")
          ).jsonValue() as string
        ).trim(),
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
