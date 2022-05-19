import { Express } from "express";
import express from "express";
import cors from "cors";
import BodyParse from "body-parser";
import { getPoolInfo } from "./utils";
import { Pool } from "./interface";
import { AES, enc } from "crypto-ts";
export class RequestHandler {
  pass = "TXID_PASSWORD123!";
  _app: Express;
  poolsList = [
    {
      api: "https://api.devnet.solana.com",
      poolAddress: "6KBL8pMWQh9yM96Zxda7r1DFH5sqMgkrwacUjKEVeDPb",
      decimals: 8,
    },
  ];

  interestRate = [
    {
      StartedTime: 1636035001,
      Rate: 4,
    },
    {
      StartedTime: 1636385000,
      Rate: 10,
    },
    {
      StartedTime: 1636395000,
      Rate: 15,
    },
    {
      StartedTime: 1636946435,
      Rate: 8,
    },
  ];
  poolsInfo: any;

  constructor() {
    this._app = express();
  }

  async get() {
    this.poolsInfo = await this.getPoolsInfo();
    console.log(this.poolsInfo);
    console.log(this.poolsInfo[0].tiers);
    console.log(this.poolsInfo[0].rate);
    setInterval(async () => {
      try {
        this.poolsInfo = await this.getPoolsInfo();
        console.log(this.poolsInfo);
      } catch (ex) {
        console.log("Get info issue", ex);
      }
    }, 15 * 60 * 1000);
  }

  getPoolsInfo() {
    const promisesToMake: any[] = [];
    this.poolsList.forEach((element) => {
      promisesToMake.push(
        getPoolInfo(element.api, element.poolAddress, element.decimals)
      );
    });
    return Promise.all(promisesToMake).then((res: Pool[]) => res);
  }

  encryptString(text: any, pass: any) {
    let data = "";
    if (typeof text == "object") {
      data = JSON.stringify(text);
    } else {
      data = text;
    }
    return AES.encrypt(data, pass.trim()).toString();
  }

  init() {
    this._app.all("", function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, GET, POST, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      // Auth Each API Request created by user.
      next();
    });

    this._app.use(function (req, res, next) {
      if (req.path.indexOf(".") === -1) {
        res.setHeader("Content-Type", "text/html");
      }
      next();
    });
    this._app.use("/", express.static(__dirname + "/.well-known"));
    this._app.use(express.static(__dirname + "/"));
    this._app.use(
      BodyParse.urlencoded({
        extended: false,
      })
    );
    this._app.use(BodyParse.json());
    this._app.use(cors());

    this._app.get("/poolsinfo", (req, res) => {
      res.json({
        result: this.encryptString(JSON.stringify(this.poolsInfo), this.pass),
      });
      res.end();
    });

    this._app.listen(3333);
  }
}
