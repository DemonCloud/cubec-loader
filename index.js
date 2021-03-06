const fs = require('fs');
const path = require('path');
const findIncludeReg = /{{@([^}]+)}}/gim;
const optCubec = {
  comment: /<!--(.*?)-->/gim,
  script: /<script>(.*?)<\/script>/gim,
};

function optCubecTemplate(res = '') {
  return res
    .replace(optCubec.comment, '')
    .replace(optCubec.script,'');
}

module.exports = function(content, map) {
  this.cacheable();

  let template;
  let filePath = this.resourcePath;
  let fileDir = filePath.split('/');
  fileDir.pop();
  fileDir = fileDir.join('/');

  const includeTemplate = function(match, find) {
    let finder = find.trim().split(' ');

    if (finder[0] === 'include') {
      let includePath = finder[1];

      if (includePath.search('.cubec') === -1) includePath += '.cubec';

      includePath = path.join(fileDir, includePath);

      if (fs.existsSync(includePath)) {
        let replaceContent = fs.readFileSync(includePath, 'utf-8');

        return (replaceContent || '').replace(findIncludeReg, includeTemplate);
      }

      return '';
    }

    return match;
  };

  this.value = template = optCubecTemplate((content || '').replace(findIncludeReg, includeTemplate));

  return 'module.exports = ' + JSON.stringify(template);
};
