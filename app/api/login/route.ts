import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { createHash } from "crypto";
import { JSDOM } from "jsdom";
import * as cookie from "cookie";

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

const urlLogin = "http://220.231.119.171/kcntt/login.aspx";

export const POST = async (request: Request) => {
  const { username, password } = await request.json();

  const session = await client.get(urlLogin);
  const DOMsession = new JSDOM(session.data);
  // Util Function
  const getAllFormElements = (element: HTMLFormElement) =>
    Array.from(element.elements).filter(
      (tag) =>
        ["select", "textarea", "input"].includes(tag.tagName.toLowerCase()) &&
        tag.getAttribute("name")
    );
  // Create Body
  const body = new URLSearchParams();
  getAllFormElements(
    DOMsession.window.document.getElementById("Form1") as HTMLFormElement
  ).forEach((_: any) => {
    const key = _.getAttribute("name");
    let value = _.getAttribute("value");
    if (key == "txtUserName") {
      value = username;
    } else if (key == "txtPassword") {
      value = createHash("md5").update(password).digest("hex");
    }
    if (value) body.append(key, value);
  });
  // Post!
  const data = await client.post(session.request.res.responseUrl, body);
  const testError = new JSDOM(data.data);
  const errorInfo = testError.window.document.getElementById("lblErrorInfo");
  if (errorInfo && errorInfo.textContent !== "") {
    return new Response(
      JSON.stringify({
        error: true,
        message: errorInfo.textContent,
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }

  function getCookieSignInJSON(): {
    key: "SignIn";
    value: string;
    domain: string;
    path: string;
    httpOnly: boolean;
    hostOnly: boolean;
    creation: string; // ISO Date
    lastAccessed: string; // ISO Date
    sameSite: string;
  } {
    return jar
      .getCookiesSync("http://220.231.119.171")
      .find((o) => o.key == "SignIn")
      ?.toJSON() as any;
  }

  return new Response(
    JSON.stringify({
      error: false,
      message: "Đăng nhập thành công!",
    }),
    {
      headers: {
        "Set-Cookie": cookie.serialize("SignIn", getCookieSignInJSON().value),
      },
    }
  );
};
