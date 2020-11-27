const { getInput, setFailed } = require('@actions/core');
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
    await deleteVersions(inputs);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
