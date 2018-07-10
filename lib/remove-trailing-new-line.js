const removeTrailingNewLine = (str) => {
    str = str.replace(/^\s+|\s+$/g, '');
    return str
}

exports.removeTrailingNewLine = removeTrailingNewLine
