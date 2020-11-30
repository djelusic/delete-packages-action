const { getInput, setFailed, info } = require('@actions/core');
const { context } = require('@actions/github');
const deleteVersions = require('./delete-versions');

async function run() {
  try {
    const inputs = {
      owner: getInput('owner') || context.repo.owner,
      repo: getInput('repo') || context.repo.repo,
      keepCnt: getInput('keepCnt'),
      token: getInput('token'),
    }
    const deleted = await deleteVersions(inputs);
    deleted.forEach(package => {
      package.versions.forEach(v => {
        info(`Deleted ${package.name} version ${v.version}`);
      });
    });
  } catch (error) {
    setFailed(error.message);
  }
}

run();
