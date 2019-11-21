const createLogDrain = require("./create-log-drain");
const getMetadata = require("./get-metadata");

module.exports = async function setup({ clientState, configurationId, teamId, token }) {
  const key = (clientState.key || '').trim();
  if (!key) {
    return { errorMessage: `API Key is required` };
  }

  console.log("getting metadata", configurationId);
  const metadata = await getMetadata({ configurationId, teamId, token });

  let errorMessage;
  console.log("creating a new log drain", configurationId);
  try {
    drain = await createLogDrain(
      {
        token: metadata.token,
        teamId
      },
      {
        name: "Datadog drain",
        type: "json",
        url: `https://http-intake.logs.datadoghq.com/v1/input/${encodeURIComponent(key)}`
      }
    );
  } catch (err) {
    console.error("Failed to create log drain", configurationId, err);
    errorMessage =
      err.body && err.body.error ? err.body.error.message : err.message;
  }

  return { drain, errorMessage };
}
