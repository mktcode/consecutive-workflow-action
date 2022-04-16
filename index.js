const core = require('@actions/core')
const github = require('@actions/github')

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function run() {
  try {
    const token = core.getInput('token')
    const interval = core.getInput('interval')
    const branch = core.getInput('branch')

    const octokit = github.getOctokit(token)

    const owner = github.context.payload.repository.owner.login
    const repo = github.context.payload.repository.name

    // get current run (to know the workflow_id)
    let { data: currentRun } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: github.context.runId,
    })

    // fetch the lastest workflow runs queued and in_progress
    const { data: { workflow_runs: queued } } = await octokit.rest.actions.listWorkflowRuns({ owner, repo, status: 'queued', workflow_id: currentRun.workflow_id, branch })
    const { data: { workflow_runs: inProgress } } = await octokit.rest.actions.listWorkflowRuns({ owner, repo, status: 'in_progress', workflow_id: currentRun.workflow_id, branch })
    const runs = [ ...queued, ...inProgress ]

    // to take into account that runs can be deleted: sort runs by number and pick the runs with a number smaller than the current one
    let lastRuns = runs.sort((a, b) => b.run_number - a.run_number).filter(run => run.run_number < currentRun.run_number)

    // re-check in intervals, as long as it has not completed
    if (lastRuns.length) {
      core.info(`Found active workflow runs (${JSON.stringify(lastRuns.map(obj => obj.id))})`)
      if (branch) {
        core.info(`on branch "${branch}"`)
      }

      for (let lastRun of lastRuns) {
        while (lastRun.status !== 'completed') {
            core.info(`Run (${lastRun.id}) not completed yet. Waiting for ${interval} seconds.`)
            await sleep(interval)
            let { data: updatedRun } = await octokit.rest.actions.getWorkflowRun({
              owner,
              repo,
              run_id: lastRun.id,
            })
            lastRun = updatedRun
          }
          core.info(`Run (${lastRun.id}) has completed.`)
      }
    } else {
      core.info(`No active workflow runs found.`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
