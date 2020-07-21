const queries = require("./queries");
const keys = require("./keys");

const authenticateChatId = async (chatId) => {
    const id = await queries.getWhitelistByGroupId(chatId);
    return keys.isBeta || !!id;
}

module.exports = { authenticateChatId };
