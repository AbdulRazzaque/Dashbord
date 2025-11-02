import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/private.pem");

// { use: "sig" } means jwk sirf use hongi token ke signature ko verify karne ke liye
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");

// eslint-disable-next-line
console.log(jwk);
