const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
// const cheerio = require('cheerio')
// const zlib = require('zlib');
// const fs = require('fs');
// const gunzipStream = zlib.createGunzip();
const logSwitch = false;//控制台是否打印评论详细信息开关

let count = 0;

/**
 * 打印数据
 * @param {*} songID 
 * @param {*} resData 
 */
let printInfo = (songID, resData) => {
    console.log(`------------------------第 (${count++}) 首歌曲--------------------------`);
    console.log(`歌曲链接：http://music.163.com/?timer=tc#/song?id=${songID}`);
    console.log(`评论总数：${resData.total}`);
    console.log(`精彩评论：${resData.hotComments.length}`);
    if(logSwitch) {
        resData.hotComments.forEach((item, index) => {
            console.log(`${item.user.nickname}:    获赞:(${item.likedCount}个)
        --> ${item.content}
            `);
        });
        console.log(`最新评论：${resData.comments.length}`);
        resData.comments.forEach((item, index) => {
            console.log(`${item.user.nickname}:    获赞:(${item.likedCount}个)
        --> ${item.content}
            `);
        });
    }
    else {
        console.log(`最新评论：${resData.comments.length}`);
    }
}

/**
 * 写文件到磁盘
 * @param {*} songID 
 * @param {*} resData 
 */
let writeFile = (songID, resData) => {
// fs.writeFile(filename, data, [options], callback)
    resData.musicID = songID;
    resData.logCount = count;
    fs.appendFile(path.join(__dirname, 'data.json'), JSON.stringify(resData), function (err) {
            if (err) throw err;
            // console.log("Export Account Success!");
    });
}

/**
 * 解码参数
 */
let postData = querystring.stringify({
  'params':'IRxdefwoXs2Xc5wjf+7Q95AAn68tkXOtj0TF8o9lVMGLsgqg03tStZgMT6ybFyTHPu6vUaITbTW9P6YLtdnKukAim3BWyJrV+aHXkHs6KGOX7ODyJyZylCCtR0gs++Irr+mBxhdwJj09HP/4z5uaNDqZjzf/u8GXp5KCsQBV1oUWGHeKYN1L8jCbGpCZySOl',
  'encSecKey':'5bc7409cded7fbb2ba0f07d6adf59dd141a9dfdd173d94a1a7deebfe9b84870cf609990162517f3bf5678c0c464fef6b5d97518857b85e6f35368c2ff70387d497a0453e83ff421db85364525547e96120a2221cee1fd77cd8649066b9a726ab398c094b61be9bce1c27072fda4da5e974a2abd5d392ff8fff660c724e5b8a47'
});

/**
 * 请求头
 */
let option = {
    hostname: 'music.163.com',
    post: 80,
    path: '',
    // path: '/weapi/v1/resource/comments/R_SO_4_2080326?csrf_token=',
    method: 'POST',
    headers: {
        'Accept':'*/*',
        'Accept-Encoding':'',
        'Accept-Language':'zh-CN,zh;q=0.8',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive',
        'Content-Length': postData.length,
        'Content-Type':'application/x-www-form-urlencoded',
        'Cookie':'_ntes_nnid=d4f1f8a35b60589e598917a9aea68d2d,1485063186559; _ntes_nuid=d4f1f8a35b60589e598917a9aea68d2d; vjuids=-1c7fddbaf.159de646ffc.0.b4be15b03bf1e; usertrack=c+5+hligb0V3MHRsFmK3Ag==; vjlast=1485494841.1490342673.11; vinfo_n_f_l_n3=6448bee7253b7a45.1.4.1485494841401.1489049705638.1490343056867; _ga=GA1.2.1441860845.1486909257; playerid=90966100; JSESSIONID-WYYY=9b3DgY%5CGm8xTDPPETNNf4dJAohbwJhcqdts5xcl79GtV%2FROKP3BmES%5Co21h9Y%2Blh5y57sRjGE1nUoby52TBteF%5C%5Cp9J%2Bf5YG4cffgbx9vPucEp3McmxB%5C%5CO91IKkCW9nlsB2Zcnz71Z51H%2FKcoejVYCmI5HG0xKlBUWh3ckCNJxdRG95%3A1490514696421; _iuqxldmzr_=32; __utma=94650624.1386554663.1485063188.1490507005.1490512898.15; __utmb=94650624.8.10.1490512898; __utmc=94650624; __utmz=94650624.1490455193.13.9.utmcsr=jianshu.com|utmccn=(referral)|utmcmd=referral|utmcct=/p/07ebbb142c73',
        'Host':'music.163.com',
        'Origin':'http://music.163.com',
        'Pragma':'no-cache',
        'Referer':'',
        // 'Referer':'http://music.163.com/song?id=2080326',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    }
};

/**
 * 数据请求函数
 * @param {*} songID 
 * @param {*} option 
 * @param {*} postData 
 */
let getComment = (songID, option, postData) => {
    let str = '';
    let req = http.request(option, (res) => {
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf-8');
        res.on('data', (data) => {
            str += data;
        });

        res.on('end', () => {
            let resData = JSON.parse(str);
            if(resData.total == 0)//忽略评论数为0的歌曲
                return;
            printInfo(songID, resData);
            writeFile(songID, resData);
            // console.log('数据结束');
        });
    });

    req.on('error', (e) => {
        console.log(`请求遇到问题: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

/**
 * 自执行入口函数
 */
//2080326这首是Nothing's Gonna Change My Love For You
(main = () => {
    // let songID = 2080326;
    // option.path = '/weapi/v1/resource/comments/R_SO_4_' + songID + '?csrf_token=';
    // option.headers.Referer = 'http://music.163.com/song?id=' + songID;
    // getComment(songID, option, postData );

    let songID = 2080326;
    for(let i = songID; i < songID + 100; i++) {
        option.path = '/weapi/v1/resource/comments/R_SO_4_' + i + '?csrf_token=';
        option.headers.Referer = 'http://music.163.com/song?id=' + i;
        getComment(i, option, postData );
    }
})();



