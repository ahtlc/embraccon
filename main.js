const gel = selector => document.querySelector(selector);

const convertFile = (e) => {
  const file = e.target.files[0];
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsText(file);
  });
};

gel('#convert').addEventListener('change', (e) => {
  convertFile(e).then((data) => {
    console.log(data);
  });
});