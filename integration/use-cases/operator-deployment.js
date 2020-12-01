const utils = require("./lib/utils");
const {
  screenshotsFolder,
} = require("../args");
const path = require("path");

test("Deploys an Operator", async () => {
  await page.goto(getUrl("/#/c/default/ns/kubeapps/operators"));

  await expect(page).toFillForm("form", {
    token: process.env.ADMIN_TOKEN,
  });

  await page.evaluate(() =>
    document.querySelector("#login-submit-button").click()
  );

  // Browse operator
  await expect(page).toClick("a", { text: "prometheus" });

  await page.screenshot({
    path: path.join(__dirname, `../${screenshotsFolder}/operator-deployment-1.png`), 
  });

  await expect(page).toClick("cds-button", { text: "Deploy" });

  await page.screenshot({
    path: path.join(__dirname, `../${screenshotsFolder}/operator-deployment-2.png`), 
  });

  // Deploy the Operator
  await expect(page).toClick("cds-button", { text: "Deploy" });

  await utils.retryAndRefresh(page, 2, async () => {
    // The CSV takes a bit to get populated
    await expect(page).toMatch("Installed");
  });

  // Wait for the operator to be ready to be used
  await expect(page).toClick("a", { text: "Catalog" });

  await utils.retryAndRefresh(page, 10, async () => {
    // Filter out charts to search only for the prometheus operator
    await expect(page).toClick("label", { text: "Operators" });

    await expect(page).toMatch("Prometheus");

    await expect(page).toClick(".info-card-header", { text: "Prometheus" });
  });

  await page.screenshot({
    path: path.join(__dirname, `../${screenshotsFolder}/operator-deployment-3.png`), 
  });

  await utils.retryAndRefresh(page, 2, async () => {
    // Found the error "prometheuses.monitorin.coreos.com not found in the definition of prometheusoperator"
    await expect(page).toClick("cds-button", { text: "Deploy" });
  });

  await expect(page).toMatch("Installation Values");

  // Update
  await expect(page).toClick("cds-button", { text: "Update" });

  await expect(page).toMatch("creationTimestamp");

  await page.screenshot({
    path: path.join(__dirname, `../${screenshotsFolder}/operator-deployment-4.png`), 
  });

  await expect(page).toClick("cds-button", { text: "Deploy" });

  await expect(page).toMatch("Ready");

  // Delete
  await expect(page).toClick("cds-button", { text: "Delete" });

  await expect(page).toMatch("Are you sure you want to delete the resource?");

  await expect(page).toClick(
    "div.modal-dialog.modal-md > div > div.modal-body > div > div > cds-button:nth-child(2)",
    {
      text: "Delete",
    }
  );

  // Goes back to application list
  await expect(page).toMatch("Applications", { timeout: 60000 });
});
