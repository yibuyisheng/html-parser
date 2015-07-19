import {EventEmitter} from 'events';

function firstNext(genObj) {
    genObj.next();
    return genObj;
}

function genObjInvoke(genObj, methodName, value) {
    return genObj ? genObj[methodName](value) : undefined;
}

function* tag(parser, next) {
    let btwStrArr = []; // 暂存当前节点类型和标签下的内容
    let type; // 指示当前节点类型（tag or text，text包含除tag之外的所有内容）
    let tag; // 指示当前是什么标签

    try {
        while (true) {
            let ch = yield;

            if (!type) {
                type = {'<': 'tag'}[ch];
                type = type ? type : 'text';
                if (type === 'tag') {
                    continue;
                }
            }

            if (type === 'tag') {
                // 如果当前处理的是 script 标签，则遇到 </script> 才标志着该标签的结束，
                // 其内部的各种小于大于符号都不能当成标签开关符号处理。
                // style 标签也有类似处理
                // 注释也这样处理
                if (tag === 'script' || tag === 'style' || tag === '!--') {
                    btwStrArr.push(ch);

                    // 检查一下是不是到了 </script> 了，
                    // 如果是到了，就标志着这段 script 解析结束了
                    let tagEndLength = tag === '!--' ? tag.length : (tag.length + 3);
                    if (ch === '>'
                        && /<\/script>|<\/style>|-->/i.test(btwStrArr.slice(-tagEndLength).join('').toLowerCase())
                    ) {
                        let content = btwStrArr.slice(0, -tagEndLength).join('');
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
                    continue;
                }

                // 走到了一个开始标签的结束位置或者注释标签，就可以做一些深入判断了，
                // 比如这是个什么标签？如果是 script 标签的话，还要对后面的内容做特殊处理
                if (ch === '>' || btwStrArr.slice(0, 3).join('') === '!--') {
                    let content = btwStrArr.join('');
                    // 看一下是什么标签
                    tag = content.match(/^\s*[!|\/]{0,1}[a-z|A-Z|-]+\s*/)[0].toLowerCase().replace(/\s/g, '');

                    // 如果是 script 标签，那么后面的那一坨位于 </script> 之前的内容都当做代码对待，
                    // style 标签也类似
                    // 如果是注释的话，其内部的小于大于等特殊符号也要一般化处理
                    if (tag === 'script' || tag === 'style' || tag === '!--') {
                        btwStrArr = [];
                        btwStrArr.tagContent = content;
                        continue;
                    }

                    // 普通标签结束
                    genObjInvoke(next, 'next', {type: type, tag: tag, startStr: content});
                    type = undefined;
                    tag = undefined;
                    btwStrArr = [];
                    continue;
                }
            }

            if (type === 'text' && ch === '<') {
                genObjInvoke(next, 'next', {type: type, content: btwStrArr.join('')});
                type = type === 'text' ? 'tag' : undefined;
                btwStrArr = [];
                continue;
            }

            btwStrArr.push(ch);
        }
    } finally {
        genObjInvoke(next, 'return');
    }
}

/**
 * 处理普通标签（除了script、style）
 */
function* normalTag(parser, next) {
    let queue = []; // 标签对象队列

    try {
        while (true) {
            let value = yield;
            // 如果是普通标签，则要解析出来属性、内容
            if (value.type === 'tag') {
                // 已经有了 children ，不再往下解析
                if (value.children instanceof Array) {
                    let tagObj = {
                        tag: value.tag === '!--' ? '#comment' : value.tag.replace(/\/$/, ''),
                        attrs: parseAttr(value.startStr, value.tag),
                        children: value.children
                    };

                    if (!queue.length) {
                        emitTagInfo(tagObj);
                    } else {
                        let lastOfQueue = queue[queue.length - 1];
                        lastOfQueue.children.push(tagObj);
                        tagObj.parent = lastOfQueue;
                    }
                }
                // 如果是类似于 <hr /> 、 <br /> 这种的标签
                else if (value.startStr.slice(-1) === '/') {
                    let tagObj = {
                        tag: value.tag.replace(/\/$/, ''),
                        attrs: parseAttr(value.startStr, value.tag),
                        children: []
                    };

                    if (!queue.length) {
                        emitTagInfo(tagObj);
                    } else {
                        let lastOfQueue = queue[queue.length - 1];
                        lastOfQueue.children.push(tagObj);
                        tagObj.parent = lastOfQueue;
                    }
                }
                // 如果是结束标签
                else if (value.tag.slice(0, 1) === '/') {
                    if (!queue.length) {
                        throw new Error(`<${value.tag}> 结束标签前面未找到相应的开始标签。`);
                    }

                    let hasMatch = false; // 是否有相匹配的开始标签
                    let i;
                    let tagObj;
                    for (i = queue.length - 1; i >= 0; i--) {
                        tagObj = queue[i];
                        if (`/${tagObj.tag}` === value.tag) {
                            hasMatch = true;
                        }
                    }

                    if (hasMatch) {
                        // 从 i+1 到 queue.length-1 的元素是兄弟节点的关系，
                        // 并且没有子节点。
                        // 此处需要纠正一下，同时它们的共同父节点是 queue[i]
                        if (i + 1) {
                            for (let j = i + 1, jl = queue.length - 1; j < jl; j++) {
                                queue[j].children = [];
                                queue[j].parent = queue[i];
                            }
                        }

                        queue = queue.slice(0, i);
                        if (!queue.length) {
                            emitTagInfo(tagObj);
                        }
                    }
                    // 没找到匹配，有问题
                    else {
                        throw new Error(`错误的结束标签 <${value.tag}>。`);
                    }
                }
                // 如果是开始标签，则构造一个关于该标签的对象 tagObj，
                // 而且根据由上至下的 html 字符串解析流程，
                // 后面的 tag 肯定是前面 tag 的儿子
                else {
                    let tagObj = {
                        tag: value.tag,
                        attrs: parseAttr(value.startStr, value.tag),
                        children: []
                    };
                    if (queue.length) {
                        let lastOfQueue = queue[queue.length - 1];
                        lastOfQueue.children.push(tagObj);
                        tagObj.parent = lastOfQueue;
                    }
                    queue.push(tagObj);
                }
            }
            // 如果是文本，则稍微包装一下就行了
            else if (value.type === 'text') {
                let obj = {tag: '#text', content: value.content};

                // 如果 queue 不为空，则当前的文本节点是 queue 最后一个元素的儿子
                if (queue.length) {
                    let lastOfQueue = queue[queue.length - 1];
                    lastOfQueue.children.push(obj);
                    obj.parent = lastOfQueue;
                }
            }
        }
    } finally {
        if (queue.length) {
            emitTagInfo(queue[0]);
        }
    }

    // 解析属性字符串
    function parseAttr(startStr, tagName) {
        startStr = startStr.replace(new RegExp(tagName, 'i'), '');
        let obj = {};
        for (let pair of startStr.split(/\s/)) {
            if (!pair.replace(/\s/g, '')) {
                continue;
            }

            let [key, value] = pair.split('=');
            obj[key] = value;
        }
        return obj;
    }

    // 抛出一颗标签树的信息
    function emitTagInfo(rootTag) {
        if (Object.prototype.toString.call(rootTag) === '[object String]'
            || !(rootTag.children instanceof Array)
        ) {
            return;
        }
        parser.emit('tag', rootTag);
        for (let tagObj of rootTag.children) {
            emitTagInfo(tagObj);
        }
    }
}

export default function (tplStr) {
    let emitter = new EventEmitter();

    setTimeout(() => {
        let genObj = firstNext(tag(
            emitter,
            firstNext(normalTag(emitter))
        ));

        for (let i = 0, il = tplStr.length; i < il; i++) {
            let ch = String.fromCharCode(tplStr[i]);
            genObj.next(ch);
        }

        genObj.return();
    });

    return emitter;
};
