const queries = require("./queries");

const authenticateChatId = async (chatId) => {
    const id = await queries.getWhitelistByGroupId(chatId);
    return !!id;
}

module.exports = { authenticateChatId };
