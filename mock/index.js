import Mock from "mockjs";
import Admin from "./admin.js";
import List from "./list.js";
import { mockXHR, param2Obj} from "./utils.js";

Mock.setup({
  timeout: "300-600",
});
const response = (req) => {
  console.log(req);
  return {
    code: 200,
    msg: "success",
    data: "",
  };
};
function getResponse(data) {
  let msg;
  let response;
  for (let k in data) {
    if(typeof data[k] == 'number') data[k] = data[k].toString();
    if (data[k] == undefined || data[k] == null || data[k] == "") {
      msg = k + "不能为空";
      break;
    }
  }
  if (msg) {
    response = {
      code: 500,
      msg: msg,
      data: "",
    };
  } else {
    response = {
      code: 200,
      msg: "success",
      data: "",
    };
  }
  return response;
};
//add
const addResponse = (req) => {
  console.log(req);
  let data = req.body;
  let response = getResponse(data)
  return response;
};
const delResponse = (req) => {
  let data = param2Obj(req.url);
  let response = getResponse(data)
  return response;
};
//admin
let mocks = [
  { url: "/user/logout", type:"post", response: response},
  { url: "/user/login", type: "post", response: Admin.loginServ },
  { url: "/user/register", type: "post", response: addResponse },
  { url: "/user/logout", type: "get", response: response },
  { url: "/user/checkUserName?userName=", type: "get", response: Admin.checkNameServ},
  { url: "/user/updateUser", type:"get", response: response},
  { url: "/user/resetPasswd", type:"post", response: response},
  { url: "/user/modifyEmail", type:"post", response: response},
  { url: "/user/modifyPasswd", type:"post", response: response},
  { url: "/user/sendCode", type:"post", response: Admin.codeServ},
  { url: "/user/queryUserByName", type:"post", response: Admin.userServ},
  { url: "/user/queryUserById", type:"post", response: Admin.userServ},
  { url: "/user/queryClubAndChannelAddress", type:"post", response: Admin.walletServ},
  { url: "/role/selectList", type: "get", response: Admin.rolesServ},
  { url: "/user/list", type: "get", response: Admin.usersServ},
  { url: "/user/logs", type: "get", response: List.logsServ },
  { url: "/nft/queryNFTsByUserIdAndStatus?", type: "get", response: List.nftsServ },
  { url: "/blog/list", type: "get", response: List.blogsServ },
  { url: "/game/rewards?", type: "get", response: List.rewardsServ },
  { url: "/dashboard/data?", type: "get", response: List.dashboardServ },
  { url: "/article/detail?", type: "get", response: List.articleDetailServ },
  { url: "/blog/del", type: "delete", response: delResponse },
  { url: "/blog/add", type: "post", response: addResponse },
  { url: "/blog/edit", type: "post", response: addResponse },
  { url: "/webTransaction/save", type: "post", response: addResponse },
  { url: "/asset/queryUserAssets", type: "post", response: {code:200,msg:"success",data:20} },
  { url: "/aac/roundsList", type: "post", response: List.aacServ },
];

mockXHR(mocks);
