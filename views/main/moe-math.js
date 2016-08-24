/*
 *  This file is part of Moeditor.
 *
 *  Copyright (c) 2016 Menci <huanghaorui301@gmail.com>
 *
 *  Moeditor is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Moeditor is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Moeditor. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var LRUCache = require('lrucache');
var rendered = LRUCache(1024);

var mathjax = require('electron').remote.app.moeApp.mathjax;

module.exports = class MoeditorMathRenderer {
    static renderForExport(type, str, display, cb, info) {
        mathjax.typeset({
            math: str,
            format: display ? "TeX" : "inline-TeX",
            html: type === 'pdf' ? true : false,
            svg: type === 'html' ? true : false,
            width: 0
        }, function (data) {
            var res = data.errors ? data.errors.toString() : (type === 'pdf' ? data.html : data.svg);
            if (display) {
                res = '<div style="width: 100%; text-align: center">' + res + '</div>';
            }

            cb(res, info);
        });
    }

    static render(str, display, cb, info) {
        /*let div = document.createElement('div');
        div.innerText = (display ? '$$' : '$') + str + (display ? '$$' : '$');
        div.style.display = 'none';
        document.body.appendChild(div);
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, div]);
        MathJax.Hub.Queue(() => {
            let res = div.querySelector('svg').outerHTML;
            if (display) {
                res = '<div style="width: 100%; text-align: center">' + res + '</div>';
            }
            cb(res, info);
            document.body.removeChild(div);
        });
        return;*/
        mathjax.typeset({
            math: str,
            format: display ? "TeX" : "inline-TeX",
            svg: true,
            width: 0
        }, function (data) {
            var res = data.errors ? data.errors.toString() : data.svg;
            if (display) {
                res = '<div style="width: 100%; text-align: center">' + res + '</div>';
            }

            rendered.set((display ? 'd' : 'i') + str, res);
            cb(res, info);
        });
    }

    static tryRender(str, display) {
        var res = rendered.get((display ? 'd' : 'i') + str);
        if (res === undefined) {
            try {
                res = katex.renderToString(str, { displayMode: display });
                rendered.set((display ? 'd' : 'i') + str, res);
            } catch(e) {
                res = undefined;
            }
        }
        return res;
    }
};
