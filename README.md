# Consecutive Workflow Action

Make workflow runs run consecutively.

Create a comment [here](https://github.com/mktcode/consecutive-workflow-action/issues/5) and delete it immediately and then go to the [Actions tab](https://github.com/mktcode/consecutive-workflow-action/actions) to see how the second workflow run waits for the previous one.

## Usage

```yaml
jobs:
  consecutiveness:
    runs-on: ubuntu-latest
    steps:
    - uses: mktcode/consecutive-workflow-action@e2e008186aa210faacd68ec30f6ac236f7e2f435
      with:
        token: ${{ secrets.GITHUB_TOKEN }}

  # your other jobs
  something:
    runs-on: ubuntu-latest
    needs: [ consecutiveness ]
    steps:
    # ...
```

### Security Notes:

#### Access Token

The token is needed to avoid rate limitation issues when performing API calls. I was thinking about making that optional but decided to just make you aware of the security risk and how to avoid it.

Please read [this section in the docs](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions#using-third-party-actions) before using some random action that asks for your secrets.

To use the latest version automatically, use the `main` branch.

```yaml
- uses: mktcode/consecutive-workflow-action@main
```

I recommend using a commit hash instead though, like in the usage example.

#### Workflow Permissions

It's always a good idea to [limit permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token) to the required minimum. To read information about previous runs, the workflow needs at least the `actions: read` permission.

# Alternatives

I also found these actions, which might better suit your needs:

- https://github.com/lewagon/wait-on-check-action
- https://github.com/fountainhead/action-wait-for-check

Their purpose is slightly different. You can wait for certain checks to pass and therefore you can specify a certain ref and you can wait for runs of different workflows.

**My action does only one thing: It forces runs of the same workflow to run in consecutive order.**

I needed this because I let my workflows push to the repo a lot, which fails when one run pushes in between checkout and push in another run.
