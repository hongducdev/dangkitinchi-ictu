import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { JSDOM } from "jsdom";

// btw cookie của web có thời hạn 1 năm...
const jar = new CookieJar();

const client = wrapper(
  axios.create({
    jar,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })
);

function extractTimeAndRoom(htmlTime: string, htmlRoom: string) {
  const regexTime =
    /Từ (.*?) đến (.*?): <b>\((\d+)\)<\/b><br>&nbsp;&nbsp;&nbsp;<b>(.*?)<\/b>/g;
  const regexRoom = /(<b>\((\d+)(,\d+){0,}\)<\/b><br>(.*?))/g;
  const matchesTime = Array.from(htmlTime.matchAll(regexTime));

  let template = htmlRoom.split(regexRoom);

  template = template.filter((_, i) => (i > 0 && i % 5 == 0) || i % 5 == 1);

  // chunk array

  function chunk<T>(array: T[], chunkSize: number): T[][] {
    return [].concat.apply(
      [],
      // @ts-ignore
      array.map((elem, i) =>
        i % chunkSize ? [] : [array.slice(i, i + chunkSize)]
      )
    );
  }

  // @ts-ignore
  template = chunk(template, 2);

  const hashmap: {
    [key: string]: string;
  } = {};

  // @ts-ignore
  for (const [a, b] of template) {
    (/\((\d+)(,\d+){0,}\)/g.exec(a) as any)[0]
      .replace(/[\(|\)]/g, "")
      .split(",")
      .map((_: string) => (hashmap[_] = b.trim().replace(/<br>/g, "")));
  }

  const result = [];

  for (let i = 0; i < matchesTime.length; i++) {
    // [matchString, start, end, index, extra]
    const timeMatch = matchesTime[i] || [, , , ,];

    const [, startTime, endTime, sessionNumber, roomInfo] = timeMatch;

    const data = /((Thứ \d)|(Chủ Nhật)) tiết ((\d)(,\d){0,})/gi.exec(
      roomInfo
    ) as RegExpExecArray;

    const room = hashmap[sessionNumber];

    result.push({
      startTime,
      endTime,
      sessionNumber,
      dayOfWeek: data[1],
      period: data[4].split(","),
      room,
    });
  }

  return result;
}

async function getSchedule(cookie: string): Promise<
  {
    STT: string;
    name: string;
    code: string;
    time: {
      startTime: string;
      endTime: string;
      sessionNumber: string;
      dayOfWeek: string;
      period: string[];
      room: string;
    }[];
    teacher: string;
    number: string;
    numberRegistered: string;
    credit: string;
    tuition: string;
    note: string;
  }[]
> {
  const session = await client.get(
    "http://220.231.119.171/kcntt/Reports/Form/StudentTimeTable.aspx",
    {
      headers: {
        cookie,
      },
    }
  );
  const DOMsession = new JSDOM(session.data);
  const document = DOMsession.window.document;
  const data = [];
  const rows = document.querySelectorAll("#gridRegistered tr");
  // @ts-ignore
  for (const row of rows) {
    const columns = row.querySelectorAll("td") as any;
    const timeHtml = columns[3]?.innerHTML || "";
    const roomHtml = columns[4]?.innerHTML || "";
    const timeInfo = extractTimeAndRoom(timeHtml, roomHtml);
    data.push({
      STT: columns[0]?.textContent.trim() || "",
      name: columns[1]?.textContent.trim() || "",
      code: columns[2]?.textContent.trim() || "",
      time: timeInfo,
      teacher: columns[5]?.textContent.trim() || "",
      number: columns[6]?.textContent.trim() || "",
      numberRegistered: columns[7]?.textContent.trim() || "",
      credit: columns[8]?.textContent.trim() || "",
      tuition: columns[9]?.textContent.trim() || "",
      note: columns[10]?.textContent.trim() || "",
    });
  }
  return data;
}

export const GET = async (request: Request) => {
  // get cookie
  const cookie = request.headers.get("cookie");
  // kiểm tra cookie có name là SignIn hay không
  if (cookie && cookie.includes("SignIn")) {
    const data = await getSchedule(cookie);
    return new Response(
      JSON.stringify({
        error: false,
        data,
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }
    );
  } else {
    // nếu không thì trả về response
    return new Response(
      JSON.stringify({
        error: true,
        message: "Bạn chưa đăng nhập!",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 401,
      }
    );
  }
};
