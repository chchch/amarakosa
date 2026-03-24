const fetchtry = async urls => {
    for(const url of urls) {
      const res = await fetch(url);
      if(res.ok) {
        const data = await res.json();
        if(data && data[0])
          return data[0];
      }
    }
    return null;
};

const latestCommits = async () => {
    const loc = window.location;
    const span = document.getElementById('latestcommit');
    if(span && loc.hostname.endsWith('.github.io')) {
        const sub = loc.hostname.split('.',1)[0];
        const pathsplit = loc.pathname.split('/');
        pathsplit.shift(); // pathname starts with a slash
        const repo = pathsplit.shift();
        const path = pathsplit.join('/');
        const urls = [
          `https://api.github.com/repos/${sub}/${repo}/commits?path=${path}`,
          `https://api.github.com/repos/${sub}/${repo}/commits?path=docs/${path}`
        ];
        const res = await fetchtry(urls);
        const date = new Date(res.commit.committer.date);
        const datestr = date.toLocaleString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        span.innerHTML = `Last updated <a href="${res.html_url}">${datestr}</a>.`;
    }
};

const GitHubFunctions = {
    latestCommits: latestCommits
};

export { GitHubFunctions };
