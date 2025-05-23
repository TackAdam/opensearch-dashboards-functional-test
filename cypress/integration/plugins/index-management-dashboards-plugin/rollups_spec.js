/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_PATH, IM_PLUGIN_NAME } from '../../../utils/constants';
import sampleRollup from '../../../fixtures/plugins/index-management-dashboards-plugin/sample_rollup';

const ROLLUP_ID = 'test_rollup_id';

describe('Rollups', () => {
  beforeEach(() => {
    // Set welcome screen tracking to true
    localStorage.setItem('home:welcome:show', 'true');

    // Go to sample data page
    cy.visit(`${BASE_PATH}/app/home#/tutorial_directory/sampleData`);

    // Click on "Sample data" tab
    cy.contains('Sample data').click({ force: true });
    // Load sample eCommerce data
    cy.get(`button[data-test-subj="addSampleDataSetecommerce"]`).click({
      force: true,
    });

    // Verify that sample data is add by checking toast notification
    cy.contains('Sample eCommerce orders installed', { timeout: 60000 });

    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/rollups`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains('Create rollup', { timeout: 60000 });
  });

  describe('can be created', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
    });

    it('successfully', () => {
      // Confirm we loaded empty state
      cy.contains(
        'Rollup jobs help you conserve storage space for historical time series data while preserving the specific information you need'
      );

      // Route us to create rollup page
      cy.contains('Create rollup').click({ force: true });

      // Type in the rollup ID
      cy.get(`input[placeholder="my-rollupjob1"]`).type(ROLLUP_ID, {
        force: true,
      });

      // Get description input box
      cy.get(`textarea[data-test-subj="description"]`)
        .focus()
        .type('some description');

      // Enter source index
      cy.get(`div[data-test-subj="sourceIndexCombobox"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type('opensearch_dashboards_sample_data_ecommerce{enter}');

      // Enter target index
      cy.get(`div[data-test-subj="targetIndexCombobox"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type('target_index{enter}');

      // Click the next button
      cy.get('button').contains('Next').click({ force: true });

      // Confirm that we got to step 2 of creation page
      cy.contains('Time aggregation');

      // Enter timestamp field
      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type('order_date{enter}');

      // Add aggregation
      cy.get(`button[data-test-subj="addFieldsAggregationEmpty"]`).click({
        force: true,
      });

      // Select a few fields
      cy.get(`input[data-test-subj="checkboxSelectRow-customer_gender"]`).click(
        { force: true }
      );
      cy.get(`input[data-test-subj="checkboxSelectRow-day_of_week_i"]`).click({
        force: true,
      });
      cy.get(`input[data-test-subj="checkboxSelectRow-geoip.city_name"]`).click(
        { force: true }
      );

      // Click the Add button from add fields modal
      cy.get(`button[data-test-subj="addFieldsAggregationAdd"]`).click({
        force: true,
      });

      // Confirm fields are added
      cy.contains('customer_gender');
      cy.contains('day_of_week_i');
      cy.contains('geoip.city_name');

      // Add metrics
      cy.get(`button[data-test-subj="addFieldsMetricEmpty"]`).click({
        force: true,
      });

      // Select a few fields
      cy.get(
        `input[data-test-subj="checkboxSelectRow-products.taxless_price"]`
      ).click({ force: true });
      cy.get(`input[data-test-subj="checkboxSelectRow-total_quantity"]`).click({
        force: true,
      });

      // Click the Add button from add fields modal
      cy.get(`button[data-test-subj="addFieldsMetricAdd"]`).click({
        force: true,
      });

      // Confirm fields are added
      cy.contains('products.taxless_price');
      cy.contains('total_quantity');

      cy.get(`input[data-test-subj="min-total_quantity"]`).click({
        force: true,
      });
      cy.get(`input[data-test-subj="max-total_quantity"]`).click({
        force: true,
      });
      cy.get(`input[data-test-subj="sum-total_quantity"]`).click({
        force: true,
      });
      cy.get(`input[data-test-subj="all-products.taxless_price"]`).click({
        force: true,
      });

      // Click the next button
      cy.get('button').contains('Next').click({ force: true });

      // Confirm that we got to step 3 of creation page
      cy.contains('Enable job by default');

      // Click the next button
      cy.get('button').contains('Next').click({ force: true });

      // Confirm that we got to step 4 of creation page
      cy.contains('Job name and indexes');

      // Click the create button
      cy.get('button').contains('Create').click({ force: true });

      // Verify that sample data is add by checking toast notification
      cy.contains(`Created rollup: ${ROLLUP_ID}`);
    });
  });

  describe('can be edited', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createRollup(ROLLUP_ID, sampleRollup);
    });

    it('successfully', () => {
      // Confirm we have our initial rollup
      cy.contains(ROLLUP_ID);

      // Select checkbox for our rollup job
      cy.get(`#_selection_column_${ROLLUP_ID}-checkbox`).check({ force: true });

      // Click on Actions popover menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Edit button
      cy.get(`[data-test-subj="editButton"]`).click({ force: true });

      // Wait for initial rollup job to load
      cy.contains(
        'An example rollup job that rolls up the sample ecommerce data'
      );

      cy.get(`textArea[data-test-subj="description"]`)
        .focus()
        .clear()
        .type('A new description');

      // Click Save changes button
      cy.get(`[data-test-subj="editRollupSaveChangesButton"]`).click({
        force: true,
      });

      // Confirm we get toaster saying changes saved
      cy.contains(`Changes to "${ROLLUP_ID}" saved!`);

      // Click into rollup job details page
      cy.get(`[data-test-subj="rollupLink_${ROLLUP_ID}"]`).click({
        force: true,
      });

      // Confirm new description shows in details page
      cy.contains('A new description');
    });
  });

  describe('can be deleted', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createRollup(ROLLUP_ID, sampleRollup);
    });

    it('successfully', () => {
      // Confirm we have our initial rollup
      cy.contains(ROLLUP_ID);

      // Select checkbox for our rollup job
      cy.get(`#_selection_column_${ROLLUP_ID}-checkbox`).check({ force: true });

      // Click on Actions popover menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Delete button
      cy.get(`[data-test-subj="deleteButton"]`).click({ force: true });

      // Type "delete" to confirm deletion
      cy.get(`input[placeholder="delete"]`).type('delete', { force: true });

      // Click the delete confirmation button in modal
      cy.get(`[data-test-subj="confirmModalConfirmButton"]`).click();

      // Confirm we got deleted toaster
      cy.contains(`"${ROLLUP_ID}" successfully deleted!`);

      // Confirm showing empty loading state
      cy.contains(
        'Rollup jobs help you conserve storage space for historical time series data while preserving the specific information you need'
      );
    });
  });

  describe('can be enabled and disabled', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createRollup(ROLLUP_ID, sampleRollup);
    });

    it('successfully', () => {
      // Confirm we have our initial rollup
      cy.contains(ROLLUP_ID);

      // Click into rollup job details page
      cy.get(`[data-test-subj="rollupLink_${ROLLUP_ID}"]`).click({
        force: true,
      });

      cy.contains(`${ROLLUP_ID}`);

      cy.wait(2000);

      // First check which button is enabled (not disabled/grayed out)
      cy.get(
        '[data-test-subj="enableButton"], [data-test-subj="disableButton"]'
      ).then(($buttons) => {
        // Find which button is enabled
        const enableButton = $buttons.filter(
          '[data-test-subj="enableButton"]:not([disabled])'
        );
        const disableButton = $buttons.filter(
          '[data-test-subj="disableButton"]:not([disabled])'
        );

        if (disableButton.length) {
          // If disable button is enabled, means job is currently enabled
          cy.get('[data-test-subj="disableButton"]')
            .should('not.be.disabled')
            .click({ force: true });
          cy.contains(`${ROLLUP_ID} is disabled`);

          cy.wait(2000);

          // Then enable it
          cy.get('[data-test-subj="enableButton"]')
            .should('not.be.disabled')
            .click({ force: true });
          cy.contains(`${ROLLUP_ID} is enabled`);
        } else if (enableButton.length) {
          // If enable button is enabled, means job is currently disabled
          cy.get('[data-test-subj="enableButton"]')
            .should('not.be.disabled')
            .click({ force: true });
          cy.contains(`${ROLLUP_ID} is enabled`);

          cy.wait(2000);

          // Then disable it
          cy.get('[data-test-subj="disableButton"]')
            .should('not.be.disabled')
            .click({ force: true });
          cy.contains(`${ROLLUP_ID} is disabled`);
        }
      });
    });
  });
});
