import { get, post, del ,uploadFile} from "@/utils/axios";
import { toQuery } from "@/utils/toquery";
export const userApi = {
  logout: (data) => post("/user/logout", data),
  login: (data) => post("/user/login", data),
  signup: (data) => post("/user/register", data),
  checkEmail: (data) => post("/user/validateEmailIsAvaliable?email=" + data),
  checkUser:(data)=>post("/user/queryUserByName?name="+data),
  roles: () => get("/role/selectList"),
  users: () => post("/user/list"),
  reset: (data) => post("/user/resetPasswd", data),
  password: (data) => post("/user/modifyPasswd", data),
  email: (data) => post("/user/modifyEmail", data),
  update: (data) => post("/user/updateUser", data),
  code: (data) => post("/user/sendCode", data),
  userById: (data) => post("/user/queryUserById", data),
  userByName: (data) => post("/user/queryUserByName", data),
  logs: (data) => get("/user/logs", data),
  profile: (data) => post("/user/getUserProfile", data),
  register: (data) => post("/user/createChannelLeader", data),
  wallet: (id) => post("/user/queryClubAndChannelAddress?userId=" + id),
  channel: (data) => post("/user/createChannelLeader",data),
  channelLeader:(data)=> post("/user/queryChannelLeaderByWalletAddress",data),
  abi:(data)=>uploadFile("/contract/getContractConfig",data),
};
export const adminApi = {
  login: (data) => post("/user/login", data),
  checkUser:(data)=>post("/user/queryUserByName?name="+data),
}
export const chainApi = {
  transactions: (data) => post("/blockChain/call", data),
  save: (data) => post("/webTransaction/save", data),
  getWalletUrl:(data)=> post("/user/queryBlockChainExplorer?blockChainType="+parseInt(data).toString(10)),
  list: (data) => post("/webTransaction/queryTransactionsList", data),
  eviclist: (data) => post("/webTransaction/queryBlurTransactionsList", data),
  checkToken:()=>post("/webTransaction/checkToken")
}
export const evicsApi = {
  assets: (data) => post("/asset/queryUserAssets", data),
  data: (data) => post("/asset/queryUserAsset", data),
  withdraw: (data) => post("/webTransaction/withdrawEvic", data)
}
export const cosdApi = {
  buy: (data) => post("/cosd/purchaseCOSD", data),
  stakeForClub: (data) => post("/cosd/stakeForClub", data),
  stakeForDefi: (data) => post("/cosd/stakeForDefi", data),
  stakeForSL: (data) => post("/cosd/stakeForSL", data),
  unStakeForClub: (data) => post("/cosd/unStakeForClub", data),
  unStakeForDefi: (data) => post("/cosd/unStakeForDefi", data),
  unStakeForSL: (data) => post("/cosd/unStakeForSL", data),
  checkTime:(data)=>uploadFile("/webTransaction/queryUserIsAbleForStake",data),
  checkTimeun:(data)=>uploadFile("/webTransaction/queryUserIsAbleForUnStake",data)
}
export const nftApi = {
  list: (data) => post("/nft/queryNFTsByUserIdAndStatus", data),
  status:(data)=>post("/nft/updateNFTStatus",data)
}
export const gameApi = {
  increaseChesserPts: (data) => post("/game/increaseUserChesserPts", data),
  increaseMoney: (data) => post("/game/increaseUserMoney", data),
  rewards: (data) => get("/game/rewards", data)
}
export const blogApi = {
  list: (data) => get("/blog/list", data),
  del: (data) => del("/blog/delete", data),
  edit: (data) => post("/blog/update", data),
  add: (data) => post("/blog/add", data)
}
export const dashboardApi = {
  alldata: (data) => get("/admin/sumEvicDay", data),
  evicdata: (data) => get("/admin/sumEvicDay", data),
}
export const bscApi = {
  playingList: (data) => post("/aac/roundsListPending", data),
  playList: (data) => post("/aac/roundsListFinished", data),
  rankList: (data) => post("/point/queryPointRankLimit?limit="+data),
  rank:(data) => post("/point/queryPointByUserId?userId="+data),
  checkAccount: (data)=>post("/user/queryUserByWalletAddress",data),
  updateAccount:(data)=>post("/user/register",data)
}
export const rebateApi = {
  withdraw: (data) => post("/webTransaction/withdrawAac", data),
  number: (id) => post("/user/getInvitedCount?userId="+id),
  reward: (data)=>post("/asset/queryUserAssets",data)
}
