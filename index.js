const pp = require('puppeteer');

let userInfo = {
    USER_ID: '',
    USER_PW: ''
}

await kongModule();

async function kongModule() {
    let bs = await pp.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        defaultViewport: {
            width: 1000,
            height: 1000,
        },
        headless: false,
    });

    await gotoBrowser(bs);
}

async function gotoBrowser(bs, pg) {
    if (pg) await pg.close();

    let pgpg = await bs.newPage();

    await pgpg.goto('https://www.edubeans.co.kr/');

    await firstLogin(bs, pgpg);
}

async function firstLogin(bs, pg) {
    await pg.waitForSelector('a[href="/v2_contents/member_login.asp"]');
    const lgnBtn = await pg.$('a[href="/v2_contents/member_login.asp"]');
    await lgnBtn.click();  
    await delay(2000);
    await pg.waitForSelector('input[name="user_id"]');
    await pg.waitForSelector('input[name="user_passwd"]');

    await pg.$eval('input[name="user_id"]', (ele) => {
        localStorage.setItem('USER_ID', userInfo.USER_ID);
        ele.value = localStorage.getItem('USER_ID');
    });
    await pg.$eval('input[name="user_passwd"]', (ele) => {
        localStorage.setItem('USER_PW', userInfo.USER_PW);
        ele.value = localStorage.getItem('USER_PW');
    });

    const lgn = await pg.$('input[name="btn_login"]');
    await lgn.click();

    await pg.waitForSelector('a[href="/v2_contents/my_idx.asp"]');
    
    const my = await pg.$('a[href="/v2_contents/my_idx.asp"]');
    await my.click();

    await pg.waitForSelector('table[class="table my_idx_list"]');    
    
    await pg.$$eval('table[class="table my_idx_list"]', (ele) => {
        let tb = ele[0].querySelectorAll('tbody')[0].querySelectorAll('tr');
        for(tr of tb) {
            if(tr.querySelectorAll('td')[5].innerText !== '100%') tr.querySelectorAll('td')[0].querySelector('a').click();
        };
        
    });

    await pg.waitForSelector('table[class="table my_lecture_list"]');    

    let myClass = await pg.$eval('table[class="table my_lecture_list"]', (ele) => {
        let newUrl;
        
        let seasonURL = new URLSearchParams(document.querySelector('.tab_select').querySelector('a').getAttribute('href'));
        let seasonCode = seasonURL.get('season_code');
        
        let tr = ele.querySelector('tbody').querySelectorAll('tr');

        if (tr[tr.length - 1].querySelector('.aC').innerText === '응시완료') {
            document.querySelector('a[href="my_lecture.asp?view_count=15&page=2&lecture_code=1397&season_code=17904"]').click();
            newUrl = 'PAGE2';
            return newUrl;
        }

        for(let i = 2; i < tr.length; i++) {
            if (tr[i].querySelectorAll('td')[3] && tr[i].querySelectorAll('td')[3].querySelector('.lec_yet')) {
                let a = tr[i].getAttribute('onclick').indexOf('(') + 1;
                let b = tr[i].getAttribute('onclick').indexOf(')');
                let rs = tr[i].getAttribute('onclick').substring(a,b).split(',');
                if (rs.length > 2) {
                    newUrl = `https://www.edubeans.co.kr/class/class_html5.asp?season_code=${seasonCode}&lecture_code=${rs[1]}&id=${localStorage.getItem('USER_ID')}&chapter_num=${rs[3]}&content_type=rmp`;
                } else {
                    newUrl = `https://www.edubeans.co.kr/class/class_html5.asp?season_code=${seasonCode}&lecture_code=${rs[0]}&id=${localStorage.getItem('USER_ID')}&chapter_num=${rs[1]}&content_type=rmp`;
                }
                
                return newUrl;
            }          
        }
 
        return newUrl;
    });

    if (myClass === 'PAGE2') page_02(pg, bs, myClass);
    else newPageFns(bs, myClass, pg);
}

async function newPageFns(bs, url, pg, ms) {
    let s = new URLSearchParams(url);
    const newPg = await bs.newPage();
    await newPg.goto(url);
    
    await newPg.waitForSelector('frame');
    
    $log(`${s.get('chapter_num')}번째 강의 수강중😶‍🌫️😶‍🌫️😶‍🌫️`);
    await delay((60 * 1000 * 13) + 10000);
    await newPg.$eval('frame', (ele) => {
        ele.contentWindow.window.form_class.submit()
    });

    await delay(3000);
    $log(`${s.get('chapter_num')}번째 강의 완료🤩🤩🤩`);

    await newPg.close();
    
    await pg.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

    if (ms === 'PAGE2') await page_02(pg, bs, ms);
    else await reFns(pg, bs);
}

async function reFns(pg, bs) {
    await pg.waitForSelector('table[class="table my_lecture_list"]');
    
    let myClass = await pg.$eval('table[class="table my_lecture_list"]', (ele) => {
        let newUrl;
        let seasonURL = new URLSearchParams(document.querySelector('.tab_select').querySelector('a').getAttribute('href'));
        let seasonCode = seasonURL.get('season_code');
        
        let tr = ele.querySelector('tbody').querySelectorAll('tr');
        
        for(let i = 2; i < tr.length; i++) {
            if (tr[i].querySelectorAll('td')[3] && tr[i].querySelectorAll('td')[3].querySelector('.lec_yet')) {
                let a = tr[i].getAttribute('onclick').indexOf('(') + 1;
                let b = tr[i].getAttribute('onclick').indexOf(')');
                let rs = tr[i].getAttribute('onclick').substring(a,b).split(',');
                if (rs.length > 2) {
                    newUrl = `https://www.edubeans.co.kr/class/class_html5.asp?season_code=${seasonCode}&lecture_code=${rs[1]}&id=${localStorage.getItem('USER_ID')}&chapter_num=${rs[3]}&content_type=rmp`;
                } else {
                    newUrl = `https://www.edubeans.co.kr/class/class_html5.asp?season_code=${seasonCode}&lecture_code=${rs[0]}&id=${localStorage.getItem('USER_ID')}&chapter_num=${rs[1]}&content_type=rmp`;
                }
                return newUrl;
            }          
        }
        return newUrl;
    });
    await delay(10000);
    newPageFns(bs, myClass, pg);
}

async function page_02(pg, bs, ms) {
    await pg.waitForSelector('table[class="table my_lecture_list"]');
    
    let myClass = await pg.$eval('table[class="table my_lecture_list"]', (ele) => {
        let newUrl;
        let seasonURL = new URLSearchParams(document.querySelector('.tab_select').querySelector('a').getAttribute('href'));
        let seasonCode = seasonURL.get('season_code');

        let tr = ele.querySelector('tbody').querySelectorAll('tr');
        for(let i = 0; i < tr.length; i++) {
            if (tr[i].querySelectorAll('td')[3] && tr[i].querySelectorAll('td')[3].querySelector('.lec_yet')) {
                let a = tr[i].getAttribute('onclick').indexOf('(') + 1;
                let b = tr[i].getAttribute('onclick').indexOf(')');
                let rs = tr[i].getAttribute('onclick').substring(a,b).split(',');

                if (rs.length > 2) {
                    newUrl = `https://www.edubeans.co.kr/class/class_html5.asp?season_code=${seasonCode}&lecture_code=${rs[1]}&id=${localStorage.getItem('USER_ID')}&chapter_num=${rs[3]}&content_type=rmp`;
                } else {
                    newUrl = `https://www.edubeans.co.kr/class/class_html5.asp?season_code=${seasonCode}&lecture_code=${rs[0]}&id=${localStorage.getItem('USER_ID')}&chapter_num=${rs[1]}&content_type=rmp`;
                }
                return newUrl;
            }          
        }
        return newUrl;
    });
    await delay(10000);
    newPageFns(bs, myClass, pg, ms);
}

function delay(t) {
    return new Promise((r) => setTimeout(r, t));
}

async function $log(str) {
    console.log(str);
}