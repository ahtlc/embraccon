const gel = selector => document.querySelector(selector);
let file, resultAgain, flag = true;

const convertFile = (element) => {
  file = element.files[0];
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsText(file);
  });
};

window.downloadAgain = () => {
  downloadFile();
};

window.convert = (e) => {
  try {
    convertFile(e).then((data) => {
      const xml = data.split('\n\n')[1];
      const parser = new DOMParser();  // initialize dom parser
      const srcDOM = parser.parseFromString(xml, "text/xml");
      const items = xmlToJson(srcDOM).OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
      let result = '"Data";"Conta Contabil";"Historico + Nr_Doc";"Credito";"Debito";"Saldo Final"';
      let saldoFinal = 0;
      items.forEach((item) => {
        money = item.TRNAMT >= 0 ? parseFloat(item.TRNAMT).toFixed(2) : parseFloat(item.TRNAMT * -1).toFixed(2);
        console.log(money);
        usdate = item.DTPOSTED.substr(0, 8);
        brdate = usdate.substr(6,2).concat("/", usdate.substr(4,2), "/", usdate.substr(0,4));
        result += `\n"${brdate}";"";"${item.MEMO}          ${getNrDoc(item.FITID)}";`;
        if (item.TRNTYPE === 'CREDIT') {
          result += `"${money}";"";""`;
          saldoFinal -= money;
        }
        else {
          result += `"";"${money}";""`;
          saldoFinal += money;
        }
      });
      result += `"";"";"";"";"";"${saldoFinal}"`;
      resultAgain = result;
      setTimeout(() => {
        if(flag) {
          document.getElementById('screen-container').classList.add("screen-container-large");
          document.getElementById('left-label').classList.add("left-label");
          gel('.input-wrapper label').innerText = 'Inserir outro arquivo';
          flag = false;
        }
      }, 1500);
      downloadFile(result);
    });
  } catch (error) {
    console.log(error);
  }
};

const getNrDoc = (value) => {
  let result = value;
  while ((result + '').length < 6) {
    result = '0' + result;
  }
  return result;
}

const downloadFile = (text = resultAgain) => {
  gel('body').innerHTML += `
  <a href="data:text/plain;charset=utf-8,${encodeURIComponent(text)}" id="filename-link" download="${file.name.substr(0, file.name.length - 4)}.csv" style="display: none"></a>
  `;
  gel('#filename-link').click();
  gel('#filename-link').outerHTML = '';
}