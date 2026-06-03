const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

async function run() {
  try {
    const suffixType = core.getInput("suffix", { required: false }) || "commit";

    const context = github.context;
    const isTagRelease = context.ref?.startsWith("refs/tags/");

    // --- Tag release: just return the tag version ---
    if (isTagRelease) {
      const tag = context.ref.replace("refs/tags/", "");
      const version = tag.startsWith("v") ? tag.slice(1) : tag;

      core.info(`Tag release detected: ${tag}`);
      core.setOutput("version", version);
      core.setOutput("is_release", "true");
      core.setOutput("tag", tag);
      return;
    }

    // --- Not a tag release: build suffix ---
    const suffix = await buildSuffix(suffixType);

    // Try to find the most recent tag
    let latestTag = null;
    try {
      let tagOutput = "";
      await exec.exec("git", ["describe", "--tags", "--abbrev=0"], {
        listeners: {
          stdout: (data) => {
            tagOutput += data.toString();
          },
        },
        silent: true,
        ignoreReturnCode: true,
      });

      tagOutput = tagOutput.trim();
      if (tagOutput) {
        latestTag = tagOutput.startsWith("v") ? tagOutput.slice(1) : tagOutput;
        core.info(`Most recent tag found: ${tagOutput}`);
      }
    } catch {
      core.info("No tags found in repository");
    }

    const baseVersion = latestTag ?? "0.0.0";
    const version = `${baseVersion}-${suffix}`;

    core.info(
      latestTag
        ? `Non-release push. Using latest tag ${latestTag} + suffix`
        : `Non-release push. No tags found, using 0.0.0 + suffix`,
    );

    core.setOutput("version", version);
    core.setOutput("is_release", "false");
    core.setOutput("tag", latestTag ? `v${latestTag}` : "");
  } catch (err) {
    core.setFailed(`Action failed: ${err.message}`);
  }
}

async function buildSuffix(type) {
  if (type === "date") {
    // Format: YYYYMMDD
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }

  // Default: short commit hash
  let hash = "";
  await exec.exec("git", ["rev-parse", "--short=7", "HEAD"], {
    listeners: {
      stdout: (data) => {
        hash += data.toString();
      },
    },
    silent: true,
  });
  return hash.trim();
}

run();
