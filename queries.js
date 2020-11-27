const packages = `
query getPackages($owner: String!, $repo: String! $after: String) {
  repository(owner: $owner, name: $repo) {
    packages(first: 100, after: $after) {
      edges {
        node {
          name
          versions(first: 100) {
            edges {
              node {
                id
                version
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

const packageVersions = `
query getPackageVersions($owner: String!, $repo: String!, $package: String!, $after: String) {
  repository(owner: $owner, name: $repo) {
    packages(first: 1, names: [$package]) {
      edges {
        node {
          name
          versions(first: 100, after: $after) {
            edges {
              node {
                id
                version
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    }
  }
}`;

const deletePackageVersion = `
mutation deletePackageVersion($packageVersionId: String!) {
    deletePackageVersion(input: {packageVersionId: $packageVersionId}) {
        success
    }
}`;

module.exports = {
  packages,
  packageVersions,
  deletePackageVersion,
};
