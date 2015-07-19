'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var marked0$0 = [tag, normalTag].map(regeneratorRuntime.mark);

var _events = require('events');

function firstNext(genObj) {
    genObj.next();
    return genObj;
}

function genObjInvoke(genObj, methodName, value) {
    return genObj ? genObj[methodName](value) : undefined;
}

function tag(parser, next) {
    var btwStrArr, type, tag, ch, tagEndLength, content;
    return regeneratorRuntime.wrap(function tag$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                btwStrArr = [];
                type = undefined;
                tag = undefined;
                context$1$0.prev = 3;

            case 4:
                if (!true) {
                    context$1$0.next = 39;
                    break;
                }

                context$1$0.next = 7;
                return;

            case 7:
                ch = context$1$0.sent;

                if (type) {
                    context$1$0.next = 13;
                    break;
                }

                type = ({ '<': 'tag' })[ch];
                type = type ? type : 'text';

                if (!(type === 'tag')) {
                    context$1$0.next = 13;
                    break;
                }

                return context$1$0.abrupt('continue', 4);

            case 13:
                if (!(type === 'tag')) {
                    context$1$0.next = 31;
                    break;
                }

                if (!(tag === 'script' || tag === 'style' || tag === '!--')) {
                    context$1$0.next = 19;
                    break;
                }

                btwStrArr.push(ch);

                tagEndLength = tag === '!--' ? tag.length : tag.length + 3;

                if (ch === '>' && /<\/script>|<\/style>|-->/i.test(btwStrArr.slice(-tagEndLength).join('').toLowerCase())) {
                    content = btwStrArr.slice(0, -tagEndLength).join('');

                    genObjInvoke(next, 'next', {
                        type: type,
                        tag: tag,
                        startStr: btwStrArr.tagContent,
                        children: [content]
                    });
                    btwStrArr = [];
                    type = undefined;
                    tag = undefined;
                }
                return context$1$0.abrupt('continue', 4);

            case 19:
                if (!(ch === '>' || btwStrArr.slice(0, 3).join('') === '!--')) {
                    context$1$0.next = 31;
                    break;
                }

                content = btwStrArr.join('');

                // 看一下是什么标签
                tag = content.match(/^\s*[!|\/]{0,1}[a-z|A-Z|-]+\s*/)[0].toLowerCase().replace(/\s/g, '');

                if (!(tag === 'script' || tag === 'style' || tag === '!--')) {
                    context$1$0.next = 26;
                    break;
                }

                btwStrArr = [];
                btwStrArr.tagContent = content;
                return context$1$0.abrupt('continue', 4);

            case 26:

                // 普通标签结束
                genObjInvoke(next, 'next', { type: type, tag: tag, startStr: content });
                type = undefined;
                tag = undefined;
                btwStrArr = [];
                return context$1$0.abrupt('continue', 4);

            case 31:
                if (!(type === 'text' && ch === '<')) {
                    context$1$0.next = 36;
                    break;
                }

                genObjInvoke(next, 'next', { type: type, content: btwStrArr.join('') });
                type = type === 'text' ? 'tag' : undefined;
                btwStrArr = [];
                return context$1$0.abrupt('continue', 4);

            case 36:

                btwStrArr.push(ch);
                context$1$0.next = 4;
                break;

            case 39:
                context$1$0.prev = 39;

                genObjInvoke(next, 'return');
                return context$1$0.finish(39);

            case 42:
            case 'end':
                return context$1$0.stop();
        }
    }, marked0$0[0], this, [[3,, 39, 42]]);
}

/**
 * 处理普通标签（除了script、style）
 */
function normalTag(parser, next) {
    var queue, value, tagObj, lastOfQueue, hasMatch, i, j, jl, obj, parseAttr;
    return regeneratorRuntime.wrap(function normalTag$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                parseAttr = function parseAttr(startStr, tagName) {
                    startStr = startStr.replace(new RegExp(tagName, 'i'), '');
                    var obj = {};
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = startStr.split(/\s/)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var pair = _step.value;

                            if (!pair.replace(/\s/g, '')) {
                                continue;
                            }

                            var _pair$split = pair.split('=');

                            var _pair$split2 = _slicedToArray(_pair$split, 2);

                            var key = _pair$split2[0];
                            var value = _pair$split2[1];

                            obj[key] = value;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator['return']) {
                                _iterator['return']();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    return obj;
                };

                queue = [];
                context$1$0.prev = 2;

            case 3:
                if (!true) {
                    context$1$0.next = 48;
                    break;
                }

                context$1$0.next = 6;
                return;

            case 6:
                value = context$1$0.sent;

                if (!(value.type === 'tag')) {
                    context$1$0.next = 45;
                    break;
                }

                if (!(value.tag === '!doctype')) {
                    context$1$0.next = 12;
                    break;
                }

                parser.emit('tag', {
                    tag: value.tag,
                    attrs: parseAttr(value.startStr, value.tag),
                    children: []
                });
                context$1$0.next = 43;
                break;

            case 12:
                if (!(value.children instanceof Array)) {
                    context$1$0.next = 18;
                    break;
                }

                tagObj = {
                    tag: value.tag === '!--' ? '#comment' : value.tag.replace(/\/$/, ''),
                    attrs: parseAttr(value.startStr, value.tag),
                    children: value.children
                };

                if (queue.length) {
                    lastOfQueue = queue[queue.length - 1];

                    lastOfQueue.children.push(tagObj);
                    tagObj.parent = lastOfQueue;
                }

                parser.emit('tag', tagObj);
                context$1$0.next = 43;
                break;

            case 18:
                if (!(value.startStr.slice(-1) === '/')) {
                    context$1$0.next = 24;
                    break;
                }

                tagObj = {
                    tag: value.tag.replace(/\/$/, ''),
                    attrs: parseAttr(value.startStr, value.tag),
                    children: []
                };

                if (queue.length) {
                    lastOfQueue = queue[queue.length - 1];

                    lastOfQueue.children.push(tagObj);
                    tagObj.parent = lastOfQueue;
                }

                parser.emit('tag', tagObj);
                context$1$0.next = 43;
                break;

            case 24:
                if (!(value.tag.slice(0, 1) === '/')) {
                    context$1$0.next = 40;
                    break;
                }

                if (queue.length) {
                    context$1$0.next = 27;
                    break;
                }

                throw new Error('<' + value.tag + '> 结束标签前面未找到相应的开始标签。');

            case 27:
                hasMatch = false;
                i = undefined;
                tagObj = undefined;

                for (i = queue.length - 1; i >= 0; i--) {
                    tagObj = queue[i];
                    if ('/' + tagObj.tag === value.tag) {
                        hasMatch = true;
                    }
                }

                if (!hasMatch) {
                    context$1$0.next = 37;
                    break;
                }

                // 从 i+1 到 queue.length-1 的元素是兄弟节点的关系，
                // 并且没有子节点。
                // 此处需要纠正一下，同时它们的共同父节点是 queue[i]
                if (i + 1) {
                    for (j = i + 1, jl = queue.length - 1; j < jl; j++) {
                        queue[j].children = [];
                        queue[j].parent = queue[i];
                    }
                }

                for (j = i + 1; j < queue.length - 1; j++) {
                    parser.emit('tag', queue[j]);
                }

                queue = queue.slice(0, i);
                context$1$0.next = 38;
                break;

            case 37:
                throw new Error('错误的结束标签 <' + value.tag + '>。');

            case 38:
                context$1$0.next = 43;
                break;

            case 40:
                tagObj = {
                    tag: value.tag,
                    attrs: parseAttr(value.startStr, value.tag),
                    children: []
                };

                if (queue.length) {
                    lastOfQueue = queue[queue.length - 1];

                    lastOfQueue.children.push(tagObj);
                    tagObj.parent = lastOfQueue;
                }
                queue.push(tagObj);

            case 43:
                context$1$0.next = 46;
                break;

            case 45:
                if (value.type === 'text') {
                    obj = { tag: '#text', content: value.content };

                    // 如果 queue 不为空，则当前的文本节点是 queue 最后一个元素的儿子
                    if (queue.length) {
                        lastOfQueue = queue[queue.length - 1];

                        lastOfQueue.children.push(obj);
                        obj.parent = lastOfQueue;
                    }

                    parser.emit('tag', obj);
                }

            case 46:
                context$1$0.next = 3;
                break;

            case 48:
                context$1$0.prev = 48;
                return context$1$0.finish(48);

            case 50:
            case 'end':
                return context$1$0.stop();
        }
    }, marked0$0[1], this, [[2,, 48, 50]]);
}

exports['default'] = function (tplStr) {
    var emitter = new _events.EventEmitter();

    setTimeout(function () {
        var genObj = firstNext(tag(emitter, firstNext(normalTag(emitter))));

        for (var i = 0, il = tplStr.length; i < il; i++) {
            var ch = String.fromCharCode(tplStr[i]);
            genObj.next(ch);
        }

        genObj['return']();
    });

    return emitter;
};

;
module.exports = exports['default'];
// 暂存当前节点类型和标签下的内容
// 指示当前节点类型（tag or text，text包含除tag之外的所有内容）
// 指示当前是什么标签

// 如果当前处理的是 script 标签，则遇到 </script> 才标志着该标签的结束，
// 其内部的各种小于大于符号都不能当成标签开关符号处理。
// style 标签也有类似处理
// 注释也这样处理
// 检查一下是不是到了 </script> 了，
// 如果是到了，就标志着这段 script 解析结束了

// 走到了一个开始标签的结束位置或者注释标签，就可以做一些深入判断了，
// 比如这是个什么标签？如果是 script 标签的话，还要对后面的内容做特殊处理
// 如果是 script 标签，那么后面的那一坨位于 </script> 之前的内容都当做代码对待，
// style 标签也类似
// 如果是注释的话，其内部的小于大于等特殊符号也要一般化处理
// 标签对象队列

// 遍历顺序，子孙 -> 祖先

// 如果是普通标签，则要解析出来属性、内容

// 已经有了 children ，不再往下解析

// 如果是类似于 <hr /> 、 <br /> 这种的标签

// 如果是结束标签
// 是否有相匹配的开始标签

// 没找到匹配，有问题

// 如果是开始标签

// 如果是文本，则稍微包装一下就行了

// 解析属性字符串

