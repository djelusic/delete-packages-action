const { getOctokit } = require('@actions/github');

module.exports = async function(
  token,
  query,
  parameters = {},
) {
  const graphql = getOctokit(token).graphql;
  return await graphql(
    query,
    parameters,
  );
}
