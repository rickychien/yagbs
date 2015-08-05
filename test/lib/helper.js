export default class Helper {

  static captureStream(stream){
    let oldWrite = stream.write;
    let buf = '';

    stream.write = function(chunk, encoding, callback) {
      buf += chunk.toString(); // chunk is a String or Buffer
      oldWrite.apply(stream, arguments);
    }

    return {
      unhook: function unhook() {
        stream.write = oldWrite;
      },
      captured: function() {
        return buf;
      }
    };
  }

}
