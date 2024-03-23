import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import chalk from 'chalk';

// Function to execute Git command
async function executeGitCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Function to format date with time if not specified
function formatDate(dateString) {
  if (!dateString.includes(' ')) {
    dateString += ' 00:00';
  }
  return dateString;
}

// Function to display help message
function displayHelp() {
  console.log(chalk.bold.underline('Git Log Report'));
  console.log(`
A command line tool to get commits for the current author grouped by day.

${chalk.bold('Usage:')} npx git-log-report [options]

${chalk.bold('Options:')}
  ${chalk.bold('-h, --help')}                  Display this help message
  ${chalk.bold('-o, --output <directory>')}    Output directory (default: ./output)
  ${chalk.bold('-s, --since  <date>')}         Show commits since date (format: YYYY-MM-DD or YYYY-MM-DD HH:MM)
  ${chalk.bold('-u, --until  <date>')}         Show commits until date (format: YYYY-MM-DD or YYYY-MM-DD HH:MM)

${chalk.bold('Examples:')}
  'npx git-log-report --since=\'2024-03-20\' --until=\'2024-03-22\' --output=\'./output_directory\'
`);
}


// Function to get commits for the current author grouped by day
// Function to get commits for the current author grouped by day
async function getCommits(options) {
  try {
    if (options.help || options.h) {
      displayHelp();
      return;
    }

    const author = await executeGitCommand('git config user.name');
    const since = options.since ? formatDate(options.since) : '';
    const until = options.until ? formatDate(options.until) : '';

    const gitCommand = `git log --author="${author}" --date=short --no-merges --pretty=format:'%ad|%s' ${since && `--since="${since}"`} ${until && `--until="${until}"`}`;
    const commits = await executeGitCommand(gitCommand);

    const commitsByDay = {};
    const commitsList = commits.split('\n');

    // Group commits by day
    commitsList.forEach((commit, index) => {
      const [date, message] = commit.split('|');
      if (date in commitsByDay) {
        commitsByDay[date].push(message);
      } else {
        commitsByDay[date] = [message];
      }
    });

    // Sort commits by date in chronological order
    const sortedDates = Object.keys(commitsByDay).sort();
    const sortedCommits = {};
    sortedDates.forEach(date => {
      sortedCommits[date] = commitsByDay[date];
    });

    // Generate filename including current directory name, author name, and date
    const currentDate = new Date().toISOString();
    const currentDirectory = path.basename(process.cwd());
    const fileName = `${currentDirectory}_${author.replace(/\s/g, '_')}_${currentDate}_commits.txt`;
    const filePath = path.join(options.output, fileName);

    // Write commits to file
    const fileStream = fs.createWriteStream(filePath);

    let totalCommits = 0; // Counter for total number of commits

    Object.keys(sortedCommits).forEach(date => {
      totalCommits += sortedCommits[date].length;
      fileStream.write(`${date}\n`);
      sortedCommits[date].forEach(message => {
        fileStream.write(`- ${message}\n`);
      });
      fileStream.write('\n');
    });

    fileStream.end();
    console.log(`Total number of commits: ${totalCommits}`); // Print total number of commits
    console.log(`Commits for ${author} grouped by day dumped into ${filePath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}


// Parse command-line arguments
const args = minimist(process.argv.slice(2), {
  alias: {
    o: 'output',
    s: 'since',
    u: 'until',
    h: 'help'
  },
  boolean: ['help'],
  default: {
    output: './output'
  }
});

// Call the function to get commits with the options passed as arguments
getCommits(args);
