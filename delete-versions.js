const graphql = require('./graphql');
const queries = require('./queries');

async function findAll(token, query, params, findObject, elements = [], cursor = null) {
  while (true) {
    try {
      let rsp = await graphql(
        token,
        query,
        {
          ...params,
          after: cursor,
        }
      );
      const obj = findObject(rsp);
      elements.push(...obj.edges.map(edge => edge.node));
      const pageInfo = obj.pageInfo;
      if (!pageInfo.hasNextPage) {
        break;
      }
      cursor = pageInfo.endCursor;
    } catch(error) {
      console.log(error);
      break;
    }
  }
  return elements;
}

async function findAllPackageVersions(token, package, owner, repo) {
  let versions = package.versions.edges.map(edge => edge.node);
  const pageInfo = package.versions.pageInfo;
  if (pageInfo.hasNextPage) {
    await findAll(
      token,
      queries.packageVersions,
      {
        owner,
        repo,
        package: package.name,
      },
      rsp => rsp.repository.packages.edges[0].node.versions,
      versions,
      pageInfo.endCursor,
    );
  }
  return versions;
}

async function deletePackageVersions(token, package, owner, repo, keepCnt) {
  const versions = await findAllPackageVersions(token, package, owner, repo);

  const majorVersions = {};
  versions.forEach(v => {
    const mv = v.version.split('.')[0];
    if (!majorVersions[mv]) {
      majorVersions[mv] = [];
    }
    majorVersions[mv].push(v);
  });
  
  const toDelete = [];
  for (const key in majorVersions) {
    let vs = majorVersions[key];
    vs = vs.sort((a, b) => {
      return a.version.localeCompare(b.version);
    });
    if (vs.length <= keepCnt) {
      continue
    }
    vs = vs.slice(0, vs.length - keepCnt);
    vs.forEach(v => {
      toDelete.push(v.id);
    });
  }

  for(let i = 0; i < toDelete.length; i++) {
    await graphql(
      token,
      queries.deletePackageVersion,
      {
        packageVersionId: toDelete[i],
        headers: {
          Accept: 'application/vnd.github.package-deletes-preview+json',
        }
      }
    );
  }
}

module.exports = async function(inputs) {
  let packages = await findAll(
    inputs.token,
    queries.packages,
    {
      owner: inputs.owner,
      repo: inputs.repo,
    },
    rsp => rsp.repository.packages
  )
  packages = packages.filter(p => {
    return !p.name.startsWith('deleted_');
  });
  
  for (let i = 0; i < packages.length; i++) {
    await deletePackageVersions(
      inputs.token,
      packages[i],
      inputs.owner,
      inputs.repo,
      inputs.keepCnt,
    );
  }
}
