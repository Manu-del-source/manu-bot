const commands = new Map();

function registerCommand(name, handler) {
  commands.set(name.toLowerCase(), handler);
}

function getCommand(name) {
  return commands.get(name.toLowerCase());
}

function getCommands() {
  return commands;
}

module.exports = {
  registerCommand,
  getCommand,
  getCommands
};
