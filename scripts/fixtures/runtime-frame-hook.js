// Append only to init.js in a disposable runtime copied from the locked host.
// Uses the existing frameHandlers array; remove the copy when testing ends.
var w4LastCommand = '';
frameHandlers.push(function () {
  try {
    if (Engine.Storage.FileExists('app:w4-command.js')) {
      var command = Engine.Storage.ReadAllText('app:w4-command.js');
      if (command !== w4LastCommand) {
        w4LastCommand = command;
        var output = eval(command);
        Engine.Storage.WriteAllText('app:w4-result.txt', String(output));
      }
    }
  } catch (error) {
    Engine.Storage.WriteAllText('app:w4-result.txt', String(error) + '\n' + error.stack);
  }
});
