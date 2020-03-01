let bounty = [];
let url = location.href;

document.result = bounty;

Vue.mixin({
  methods: {
    fetchBounty: function() {
      let vm = this;
      let apiUrlBounty = `/actions/api/v0.1/bounty?github_url=${document.issueURL}`;
      const getBounty = fetchData(apiUrlBounty, 'GET');

      $.when(getBounty).then(function(response) {
        vm.bounty = response[0];
        vm.isOwner = vm.checkOwner(response[0].bounty_owner_github_username);
        document.result = response[0];
      });
    },
    checkOwner: function(handle) {
      let vm = this;

      if (vm.contxt.github_handle) {
        return caseInsensitiveCompare(document.contxt['github_handle'], handle);
      }
      return false;

    },
    checkInterest: function() {
      let vm = this;

      if (!vm.contxt.github_handle) {
        return false;
      }
      return !!(vm.bounty.interested || []).find(interest => caseInsensitiveCompare(interest.profile.handle, vm.contxt.github_handle));

    },
    checkApproved: function() {
      let vm = this;

      if (!vm.contxt.github_handle) {
        return false;
      }
      // pending=false
      let result = vm.bounty.interested.filter(interest => caseInsensitiveCompare(interest.profile.handle, vm.contxt.github_handle));

      return result ? !result.pending : false;

    },
    checkFulfilled: function() {
      let vm = this;

      if (!vm.contxt.github_handle) {
        return false;
      }
      return !!(vm.bounty.fulfillments || []).find(fulfiller => caseInsensitiveCompare(fulfiller.fulfiller_github_username, vm.contxt.github_handle));
    },
    syncGhIssue: function() {
      let vm = this;
      let apiUrlIssueSync = `/sync/get_issue_details?url=${encodeURIComponent(vm.bounty.github_url)}&token=${currentProfile.githubToken}`;
      const getIssueSync = fetchData(apiUrlIssueSync, 'GET');

      $.when(getIssueSync).then(function(response) {
        vm.updateGhIssue(response);
      });
    },
    updateGhIssue: function(response) {
      let vm = this;
      const payload = JSON.stringify({
        issue_description: response.description,
        title: response.title
      });
      let apiUrlUpdateIssue = `/bounty/change/${vm.bounty.pk}`;
      const postUpdateIssue = fetchData(apiUrlUpdateIssue, 'POST', payload);

      $.when(postUpdateIssue).then(function(response) {
        vm.bounty.issue_description = response.description;
        vm.bounty.title = response.title;
        _alert({ message: response.msg }, 'success');
      }).catch(function(response) {
        _alert({ message: response.responseJSON.error }, 'error');
      });
    },
    copyTextToClipboard: function(text) {
      if (!navigator.clipboard) {
        _alert('Could not copy text to clipboard', 'error', 5000);
      } else {
        navigator.clipboard.writeText(text).then(function() {
          _alert('Text copied to clipboard', 'success', 5000);
        }, function(err) {
          _alert('Could not copy text to clipboard', 'error', 5000);
        });
      }
    },
    fulfillmentComplete: function(fulfillment_id, amount, closeBounty, bounty_owner_address) {

      let vm = this;
      const owner_address = vm.bounty.bounty_owner_address ?
        vm.bounty.bounty_owner_address :
        bounty_owner_address;

      const token_name = vm.bounty.token_name;
      const decimals = tokenNameToDetails('mainnet', token_name).decimals;

      const payload = {
        amount: amount * 10 ** decimals,
        token_name: token_name,
        close_bounty: closeBounty,
        bounty_owner_address: owner_address
      };

      const apiUrlBounty = `/api/v1/bounty/payout/${fulfillment_id}`;

      fetchData(apiUrlBounty, 'POST', payload).then(response => {
        if (200 <= response.status && response.status <= 204) {
          console.log('success', response);
        } else {
          _alert('Unable to make payout bounty. Please try again later', 'error');
          console.error(`error: bounty payment failed with status: ${response.status} and message: ${response.message}`);
        }
      });

    }
  },
  computed: {
    sortedActivity: function() {
      return this.bounty.activities.sort((a, b) => new Date(b.created) - new Date(a.created));
    }

  }
});


if (document.getElementById('gc-bounty-detail')) {
  var appBounty = new Vue({
    delimiters: [ '[[', ']]' ],
    el: '#gc-bounty-detail',
    data() {
      return {
        bounty: bounty,
        url: url,
        cb_address: cb_address,
        isOwner: false,
        is_bounties_network: is_bounties_network,
        inputAmount: 0,
        inputBountyOwnerAddress: bounty.bounty_owner_address,
        contxt: document.contxt
      };
    },
    mounted() {
      this.fetchBounty();
    }
  });
}
