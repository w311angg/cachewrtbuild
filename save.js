const core = require('@actions/core');
const github = require('@actions/github');
const execSync = require('child_process').execSync;

try {
  const skipSave = core.getInput('skipSave');
  if (skipSave === 'true') {
    process.exit();
  };

  var paths = new Array();
  var keyString = 'cache-openwrt';
  const prefix = core.getInput('prefix');
  if ( prefix != '' ){
    process.chdir(prefix);
  }

  const branch = process.env.GITHUB_REF_NAME;
  keyString = keyString+'-'+branch;

  const toolchain = core.getInput('toolchain');
  if ( toolchain=='true' ){
    stdout=execSync('git log --pretty=tformat:"%h" -n1 tools toolchain').toString().trim();
    keyString=keyString+'-'+stdout;
    paths.push('staging_dir/host*');
    paths.push('staging_dir/tool*');
    paths.push('build_dir/host*');
    paths.push('build_dir/tool*');
  }

  const ccache = core.getInput('ccache');
  if ( ccache=='true' ){
    stdout=execSync('date +%s').toString().trim();
    keyString=keyString+'-'+stdout;
    paths.push('.ccache');
  }

  const cache = require('@actions/cache');
  console.log(keyString);
  const cacheId = cache.saveCache(paths, keyString)
  .then(res =>{
    if ( typeof res !== 'undefined' && res ){
      console.log(res, ' cache saved');
    }
  })

} catch (error) {
  core.warning(error.message);
}
