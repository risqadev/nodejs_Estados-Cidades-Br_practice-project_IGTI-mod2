import { promises as fs, readFileSync } from 'fs';

let estados = null;
let cidades = null;

init();

async function init() {
  await readFiles();

  await separateUFjson();

  cincoMaiores();
  cincoMenores();

  await maioresNomes();
  await menoresNomes();

  maiorNomeCidadeGeral();
  menorNomeCidadeGeral();
}

async function readFiles() {
  estados = JSON.parse(await fs.readFile('./Estados.json')).sort((a, b) =>
    a.Nome.localeCompare(b.Nome)
  );

  cidades = JSON.parse(await fs.readFile('./Cidades.json')).sort((a, b) =>
    a.Nome.localeCompare(b.Nome)
  );
}

async function separateUFjson() {
  const promises = estados.map(async (estado, index) => {
    const cidadesUF = cidades.filter((cidade) => cidade.Estado === estado.ID);

    estados[index].qtCidades = cidadesUF.length;

    const cidadesPorTamanhoDoNome = cidadesUF
      .map((cidade) => cidade.Nome)
      .sort((a, b) => b.length - a.length);

    estados[index].maiorTamanho = cidadesPorTamanhoDoNome[0].length;
    estados[index].menorTamanho =
      cidadesPorTamanhoDoNome[cidadesPorTamanhoDoNome.length - 1].length;

    // Comentado só para não precisar reescrever os arquivos de cada estado sempre. Descomente se precisar gerá-los novamente.
    await fs.writeFile(
      `./estados/${estado.Sigla}.json`,
      JSON.stringify(cidadesUF)
    );
  });

  await Promise.all(promises);
}

async function readUFjson(uf) {
  uf = uf.toUpperCase();
  const json = JSON.parse(await fs.readFile(`./estados/${uf}.json`));

  return json;
}

function cincoMaiores() {
  const cincoMais = estados
    .sort((a, b) => b.qtCidades - a.qtCidades)
    .slice(0, 5)
    .map((estado) => [estado.Sigla, estado.qtCidades]);

  console.log('\nCinco estados com mais cidades:');
  console.log(cincoMais);

  const soma = cincoMais.reduce((acc, item) => (acc += item[1]), 0);
  console.log(`soma: ${soma}`);
}

function cincoMenores() {
  const cincoMenos = estados
    .sort((a, b) => b.qtCidades - a.qtCidades)
    .slice(estados.length - 5)
    .map((estado) => [estado.Sigla, estado.qtCidades]);

  console.log('\nCinco estados com menos cidades:');
  console.log(cincoMenos);

  const soma = cincoMenos.reduce((acc, item) => (acc += item[1]), 0);
  console.log(`soma: ${soma}`);
}

async function maioresNomes() {
  console.log('\nMaiores nomes de cidades por estado:');

  const lista = [];

  const promises = estados.map(async ({ Sigla, maiorTamanho }) => {
    const ufJson = await readUFjson(Sigla);

    const maiores = ufJson
      .filter(({ Nome }) => Nome.length === maiorTamanho)
      .map(({ Nome }) => Nome);

    // lista.push(Sigla + ' - ' + maiores.join(', '));
    lista.push(`${Sigla} - ${maiores[0]}`);
  });

  await Promise.all(promises);

  lista.sort();

  console.log(lista);
}

async function menoresNomes() {
  console.log('\nMenores nomes de cidades por estado:');

  const lista = [];

  const promises = estados.map(async ({ Sigla, menorTamanho }) => {
    const ufJson = await readUFjson(Sigla);

    const menores = ufJson
      .filter(({ Nome }) => Nome.length === menorTamanho)
      .map(({ Nome }) => Nome);

    // lista.push(Sigla + ' - ' + menores.join(', '));
    lista.push(`${Sigla} - ${menores[0]}`);
  });

  await Promise.all(promises);

  lista.sort();

  console.log(lista);
}

function maiorNomeCidadeGeral() {
  console.log('\nMaior nome de cidades entre todos os estados:');

  const maiorTamanho = estados.sort(
    (a, b) => b.maiorTamanho - a.maiorTamanho
  )[0].maiorTamanho;

  const maiores = cidades
    .filter(({ Nome }) => Nome.length === maiorTamanho)
    .map(
      ({ Nome, Estado }) =>
        `${estados.find((estado) => estado.ID === Estado).Sigla} - ${Nome}`
    );

  console.log(maiores[0]);
}

function menorNomeCidadeGeral() {
  console.log('\nMenor nome de cidades entre todos os estados:');

  const menorTamanho = estados.sort(
    (a, b) => a.menorTamanho - b.menorTamanho
  )[0].menorTamanho;

  const menores = cidades
    .filter(({ Nome }) => Nome.length === menorTamanho)
    .map(
      ({ Nome, Estado }) =>
        `${estados.find((estado) => estado.ID === Estado).Sigla} - ${Nome}`
    );

  console.log(menores[0]);
}
