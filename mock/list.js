import Mock from "mockjs";
import { param2Obj, getList, getListNoPage } from "./utils.js";
let hotwords = Mock.mock({ "data|5": [{ value: "@cword(3, 7)" }] });
let logs = Mock.mock({ "data|28": [{ "id": "@increment(0)", "user": "@word(4, 8)", "time": "@datetime()", "type": "@word(4, 8)", "operation": "@word(4, 24)" }] });
let nfts = Mock.mock({
  "data|24": [
    {
      id: "@increment(0)",
      nft_type: "@word(5, 18)",
      blockchain: "Binance Smart Chain",
      minted_at: "@datetime()",
      "game_chances|1-100": 20,
      token_id: "0xc0661B3f0bAax2F4C10B8C400D34eCc860233be6",
      contract_address: "0xc0661B3f0bAax2F4C10B8C400D34eCc860233be6",
      src: "@image('1000x1524', '#f0f0f0')"
    },
  ],
});
let blogs = Mock.mock({
  "data|24": [
    {
      id: "@increment(0)",
      type: "@pick(['h5','vlog'])",
      title: "@word(5, 18)",
      post_at: "@datetime()",
      author: "@word(5, 8)",
      content: "@paragraph(2)",
      cover: "@image('1000x1524', '#606060', 'Hello')",
      link: "https://baidu.com",//vlog或最终文章的链接
      platform:"youtobe"
    },
  ],
});
let menus = Mock.mock({
  "data|8": [
    {
      id: "number|1-10",
      name: "@word(5, 7)",
      "children|1-10": [
        {
          id: "number|10-100",
          name: "@word(5, 7)",
          "children|0-8": [
            {
              id: "number|100-1000",
              name: "@word(5, 7)",
            },
          ],
        },
      ],
    },
  ],
});
let tags = Mock.mock({ "data|12": [{ name: "@word(5, 7)", id: "@increment(0)" }] });
let dashboard = Mock.mock({
  id: "@increment(0)",
  "opts|0-4": [{ opt: "@pick[1,2]", word: "@cword(5-12)" }], //1:通过 2：驳回
  type: "@pick[1,2,3,4]", //1-角色 2-文章 3-目录 4-标签
  "cosd|10000-200000": 14567,
  "evics|1000-2000": 1567,
  "nfts|10-20": 15,
  "games|30-50": 34,
  "clubs|2-9": 3,
  "members|20-90": 38,
  purpose: [{ name: "Starlight league", value: 20 }, { name: "Club ownership", value: 40 }, { name: "COSD earning", value: 5 }],
  line: [[{ name: "11", value: 20 }, { name: "12", value: 40 }, { name: "13", value: 5 }, { name: "14", value: 7 }],
  [{ name: "11", value: 3 }, { name: "12", value: 5 }, { name: "13", value: 60 }, { name: "14", value: 90 }],
  [{ name: "11", value: 4 }, { name: "12", value: 6 }, { name: "13", value: 80 }, { name: "14", value: 110 }]]
});
let rewards = Mock.mock({
  "data|24": [{
    "id": "@increment(0)",
    "user": "@word(5, 7)",
    "commission|30-50": 34,
    "count_of_promoted": "@float(60, 100, 3, 5)",
    "total_amount_of_promoted": "@float(60, 100, 3, 5)",
    "awards": "@float(60, 100, 3, 5)"
  }]
})
let aacs = Mock.mock({
  "data|24": [{
    "id": "@increment(0)",
    "roundIndex":"@increment(1)",
    "totalPlayers|1-8": 3,
    "createTime": "@datetime()",
    "updateTime": "@datetime()",
    "firstWinner": '0xeDa36185950708fC5562a4cde49dc6C2297cE85e',
    "secondWinner": '0xeDa36185950708fC5562a4cde49dc6C2297cE85e',
    "thirdWinner": '0xeDa36185950708fC5562a4cde49dc6C2297cE85e',
    "finished": true
  }]
})
export default {
  nftsServ: (req) => {
    console.log(req)
    return getList(req, nfts.data);
  },
  blogsServ: (req) => {
    console.log(req)
    return getList(req, blogs.data);
  },
  aacServ: (req) => {
    console.log(req)
    return getListNoPage(req, aacs.data);
  },
  rewardsServ: (req) => {
    console.log(req)
    return getList(req, rewards.data);
  },
  logsServ: (req) => {
    return getList(req, logs.data);
  },
  dashboardServ: (req) => {
    console.log(req);
    return {
      code: 200,
      msg: "success",
      data: dashboard,
    };
  },
  auditsServ: (req) => {
    const { type } = param2Obj(req.url);
    let list = [];
    if (type) {
      list = audits.data.filter((i) => i.type == type);
    } else {
      list = audits.data;
    }
    return getList(req, list);
  },
  //不分页search
  hotwordsServ: (req) => {
    console.log(req);
    return getListNoPage(req, hotwords.data);
  },
  relatedwordsServ: (req) => {
    console.log(req);
    const { word } = param2Obj(req.url);
    let relatedwords = Mock.mock({ "data|8": [{ value: (word ? word : "") + "@cword(1, 4)" }] });
    return getListNoPage(req, relatedwords.data);
  },
  menusServ: (req) => {
    console.log(req);
    return getListNoPage(req, menus.data);
  },
  tagsServ: (req) => {
    console.log(req);
    return getListNoPage(req, tags.data);
  },
  articleDetailServ: (req) => {
    console.log(req);
    return {
      code: 200,
      msg: "success",
      data: "",
    };
  },
};
