// 導入模組
var fs = require('fs')
var path = require('path')
// 可改寫副檔名及編碼
var x = '.txt'
var ru = 'utf8'
var wu = 'utf8'
// 完成後的副檔名
var afterName = ''
// 建立函數，以便回呼使用
function XmlAddMypb(go) {
    // 規範化檔案路徑
    var h = path.normalize(go)
    // 取得本檔檔名，以本檔檔名作參數，在當前目錄下：若有相同名的副檔名的檔案，就進行轉換
    // 取得本檔絕對路徑
    // var p = path.parse(__filename)
    // { root: 'D:\\',
    //   dir: 'D:\\nj',
    //   base: 'txt.js',
    //   ext: '.js',
    //   name: 'txt' }

    // 取得當前目錄下所有檔案及資料夾
    var d = fs.readdirSync(h)
    // 循環目錄
    for (var k of d) {
        // 取得絕對路徑，並規範化路徑
        var n = path.normalize(h + '/' + k)
        // 取得檔案資訊
        var c = fs.statSync(n)
        // 判斷是否為資料夾，如果是：回呼函數，來執行下一層目錄
        if (c.isDirectory()) {
            // 若只執行當前目錄，則註釋此行，並啟動返回通知
            // XmlAddMypb(n)
            console.log('Stop read Directory:' + n)

            // 判斷是否為所要轉換的副檔名的檔案
        } else if (path.extname(n) == x) {

            // 用絕對路徑讀入檔案，使用node的readFileSync同步函數
            var a = fs.readFileSync(n, ru)
            // 導入陣列
            var b = a.split('\n')

            // 首行加一空行，後來不必了，b[0]之前，不能加任何字，否則「位元組順序記號」 EF BB BF ，會跑到第2行，變成亂碼
            // b.unshift('\n')
            // 將幾個檔頭位元，改為第一行，後來這方法無效
            // if(/0xEF0xBB0xBF/.test(b[0])){
            // b[0].replace(/[0xEF|0xBB|0xBF]/,'')

            // 開頭加上<file>
            b[0] = b[0].replace(/^(.)/, '<file>\n$1')

            // 加上批次冊碼頁碼
            // 預設變量，才能累加冊碼頁碼
            var s0 = 0
            var s1 = 0
            var s2 = 1
            var sfn = 1
            var sa = 1
            for (var i = 1; i < b.length; i++) {
                // <pb>不能寫在b[0]之前，否則「位元組順序記號」 EF BB BF ，會跑到第2行，變成亂碼
                // b[i] = b[i] + '<pb n="' + j + '"/>'
                // 先刪除舊的<頁>標記
                b[i] = b[i].replace(/<頁 id.+>/, '')
                // 調整[註釋]標記
                if (/<fn /.test(b[i])) {
                    b[i] = b[i].replace(/(<fn n=")([^"]+)("\/>)/g, '<link to ="' + path.basename(n,'.txt') + '_' + sfn + '">▼</link>"')
                    sfn++
                }
                if (/<\?★/.test(b[i])) {
                    b[i] = b[i].replace(/<\?★"([^"]+)">[^\?]*\?>/g, '<a n="' + path.basename(n,'.txt') + '_' + sa + '">▲</a>')
                    sa++
                }
                // 加上冊碼頁碼
                // 多個檔案的時候，不好算出冊碼，就省去冊碼
                if (/<article/.test(b[i]) || s2 > 999) {
                    s2 = 1
                    s1++
                    // b[i] = '<pb n="' + s1 + '.' + s2 + '"/>\n' + b[i]
                    b[i] = '<pb n="' + s2 + '"/>\n' + b[i]
                    s0 = i + 30
                }
                if (i == s0) {
                    s2++
                    // b[i] = '<pb n="' + s1 + '.' + s2 + '"/>\n' + b[i]
                    b[i] = '<pb n="' + s2 + '"/>\n' + b[i]
                    s0 = i + 30
                }
            }
            // 結尾加上</file>
            b[b.length] = '</file>'


            // 用絕對路徑寫入檔案
            fs.writeFileSync(n + afterName, b.join('\n'), wu)
            // 完成時返回通知
            console.log('addpb is OK: ' + n + afterName)
        }
    }
}
// 配合timeEnd()成對出現。 打印出代碼執行的時間
console.time('共耗費了')
// 啟用函數
XmlAddMypb('./')
// 'test'名字要和time()中的名字保持一致
console.timeEnd('共耗費了')