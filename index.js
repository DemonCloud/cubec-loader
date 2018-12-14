const fs = require('fs');
const path = require('path');
const findIncludeReg = /{{@([^}]+)}}/gim;
const optCubec = {
  line: /[\r\n\f]/gim,
  quot: /\s*;;\s*/gim,
  space: /[\x20\xA0\uFEFF]+/gim,
  assert: /_p\+='(\\n)*'[^+]/gim,
  comment: /<!--(.*?)-->/gim,
  tagleft: /\s{2,}</gim,
  tagright: />\s{2,}/gim,
};

function optCubecTemplate(res = '') {
  return res
    .replace(optCubec.line, '')
    .replace(optCubec.comment, '')
    .replace(optCubec.assert, '')
    .replace(optCubec.quot, ';')
    .replace(optCubec.space, ' ')
    .replace(optCubec.tagright, '> ')
    .replace(optCubec.tagleft, ' <');
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
