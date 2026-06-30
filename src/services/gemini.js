import { sendMessage as apiSendMessage, sendFileMessage, getSystemStats } from "./api";

export async function sendMessage(message, agentId = 1) {
  const response = await apiSendMessage(message, agentId);
  return response.reply;
}

export async function sendFileMessageToAI(file, message) {
  const response = await sendFileMessage(file, message);
  return response;
}

export async function fetchSystemStats() {
  const response = await getSystemStats();
  return response;
}
