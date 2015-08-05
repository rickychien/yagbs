module.exports = [
  {
    inputs: ['file.txt'],
    outputs: 'file-copy.txt',
    rule: function() {
      exec('cp file.txt file-copy.txt');
    }
  }
];
