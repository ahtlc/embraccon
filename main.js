const gel = selector => document.querySelector(selector);
let file;

const convertFile = (e) => {
  file = e.target.files[0];
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsText(file);
  });
};

const getNrDoc = (value) => {
  let result = value;
  while ((result + '').length < 6) {
    result = '0' + result;
  }
  return result;
}

const downloadFile = (text) => {
  gel('body').innerHTML += `
    <a href="data:text/plain;charset=utf-8,${encodeURIComponent(text)}" id="filename-link" download="${file.name.substr(0, file.name.length - 4)}.txt" style="display: none"></a>
  `;
  gel('#filename-link').click();
}

gel('#convert').addEventListener('change', (e) => {
  convertFile(e).then((data) => {
    const xml = data.split('\n\n')[1];
    const parser = new DOMParser();  // initialize dom parser
    const srcDOM = parser.parseFromString(xml, "text/xml");
    const items = xmlToJson(srcDOM).OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
    let result = '"Conta";"Data_Mov";"Nr_Doc";"Historico";"Valor";"Deb_Cred"';
    items.forEach((item) => {
      result += `\n"0050003000008440";"${item.DTPOSTED.substr(0, 8)}";"${getNrDoc(item.FITID)}";"${item.MEMO}";"${item.TRNAMT >= 0 ? parseFloat(item.TRNAMT).toFixed(2) : parseFloat(item.TRNAMT * -1).toFixed(2)}";"${item.TRNTYPE === 'CREDIT' ? 'C' : 'D'}"`;
    });
    downloadFile(result);
  });
});