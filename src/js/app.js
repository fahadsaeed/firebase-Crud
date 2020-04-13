const app = new Firebase(),
  store = new DataStore(),
  deleteSuccessModalContent = `<img class="popup-icon" src="./icons/Check+Large.svg" alt="" />  
                                      <h3 class="modal-title m-t">Deleted!</h3>
                                      <p class="modal-text text-center">The account has been deleted from your database.</p>
                                      <button class="primary-success-btn" onclick="updateUserSuccess()">Great, thanks!</button>`,
  confirmationDeleteMessageModalContent = `<img class="popup-icon" src="./icons/Warning.svg" alt="">
                                            <h3 class="modal-title m-t">Are you Sure?</h3>
                                            <p class="modal-text text-center">You are about to delete this account, this can not be undone.</p>
                                            <div>
                                                <button class="primary-success-btn m-r" onclick="deleteUser()">
                                                Yes, delete!
                                                <span id="delete-account-loading" class="circle-loading hidden small m-l-h"><span></span></span>
                                                </button>
                                                <button class="primary-default-btn" onclick="closeModal()">Cancel</button>
                                            </div>`,
  accountCreatedModalContent = `<img class="popup-icon" src="./icons/Thumbs+Up+Large.svg" alt="" />  
                                  <h3 class="modal-title m-t">Account Created</h3>
                                  <p class="modal-text text-center">The new users account has been created!</p>
                                  <button class="primary-success-btn m-r" onclick="getUserListingAndCloseModel()">
                                  <span class="m-l">All done</span>
                                  <img class="m-r m-l-h" src="./icons/Party+Popper.svg" alt="" />
                                  </button>`,
  accountSaveModalContent = ` <img class="popup-icon" src="./icons/Check+Large.svg" alt="" />  
                                  <h3 class="modal-title m-t">Account Saved</h3>
                                  <p class="modal-text text-center">The users account has been saved!</p>
                                  <button class="primary-success-btn m-r" onclick="updateUserSuccess()">Great, thanks!</button>`,
  resetPasswordSuccessModalContent = `<img class="popup-icon" src="./icons/Check+Large.svg" alt="" />
                                      <h3 class="modal-title m-t">Sent!</h3>
                                      <p class="modal-text text-center m-x p-x">A password reset email has been sent to the email address associated with this user account.</p>
                                      <button class="primary-success-btn" onclick="closeModal()">Great, thanks!</button>`;

let userListing = [],
  deleteUserById = false,
  editFormId = false,
  pageLoad = false,
  dropDownMenuIsOpen = false,
  $errorMessage = "",
  $userListing = "",
  $requestLoading = "",
  $search = "",
  $email = "",
  $password = "",
  $member = "",
  $membership = "",
  $firstName = "",
  $lastName = "",
  $phone = "",
  $birthday = "",
  $address = "",
  $city = "",
  $state = "",
  $zipCode = "";

$("#long-drive-agency-app-title").text("Firebase Crud");
$(document).ready(() => {
  $errorMessage = $("#error-message");
  $userListing = $("#user-listing");
  $search = $("#search");
  $requestLoading = $("#request-loading");
  $email = $("#email");
  $password = $("#password");
  $member = $("#member");
  $membership = $("#membership");
  $firstName = $("#first-name");
  $lastName = $("#last-name");
  $phone = $("#phone");
  $birthday = $("#birthday");
  $address = $("#address");
  $city = $("#city");
  $state = $("#state");
  $zipCode = $("#zip-code");

  $(document).on("change", ".check-box", e => {
    const $ele = $(e.target),
        id = $ele.data("id"),
        checked = $ele.is(":checked");

    if (id === "check-all") {
      $(".check-box").prop("checked", $ele.is(":checked"));
      userListing.forEach(user => (user.checked = checked));
    } else {
      userListing.find(user => {
        if (user.id === id) {
          user.checked = checked;
          return user;
        }
      });
    }

    isEnableDeleteButton();
  });

  $(document).on("click", ".page-no", e => {
    const $ele = $(e.target),
        page = +$ele.text();
    if ($ele.hasClass("last-link")) arrageNextPage(page);
    if ($ele.hasClass("first-link")) arragePrevPage(page);
    pageChange(page);
  });

  $search.keyup(() => searching());
});

// close model if click modal backdrop
$(document).on("click", e => {
  const $ele = $(e.target);
  if (dropDownMenuIsOpen && !$ele.hasClass("dropper")) {
    $(".drop-down-menu").removeClass("active");
    dropDownMenuIsOpen = false;
  }
});

(() => {
  store
    .initialLoadData()
    .then(res => renderUserListing(res))
    .catch(res => {
      console.log("err on initial load data", res);
    })
    .finally(_ => {
      if (pageLoad) return;
      pageLoad = true;
      $("#table-loader").addClass("hidden");
      $("#user-table").removeClass("hidden");
      store.GetDataOnServer();
    });
})();

// Render user listing
function renderUserListing(listing) {
  userListing = JSON.parse(JSON.stringify(listing));
  let renderListing = "";
  if (!listing || !listing.length) {
    renderListing = `<tr><td colspan="5" class="text-center message">
                            ${previousSearchText ? "No Search Result Found." : "We have not computed any data for your app yet."} 
                        </td></tr>`;
  } else {
    listing.forEach(user => {
      renderListing += `<tr>
                <td>
                     <span class="checkbox">
                        <input id="checkbox-${user.id}" class="check-box checkbox__input" data-id="${
        user.id
      }"  type="checkbox" name="check-${user.id}" >
                        <label for="checkbox-${user.id}" class="checkbox__label">
                        <img class="icon-check" src="https://s3.amazonaws.com/koderlabs.com/lda/CheckboxTick.svg" alt="">
                        </label>
                     </span>
                </td>                  
                <td>${user.member}</td>
                <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.email}</td>
                        <td  class="action">
                            <button onclick="dropdownToggle('dropdown-${user.id}')" class="icon-btn dropper">
                            
                            <img class="dropper setting-icon" src="https://s3.amazonaws.com/koderlabs.com/lda/Options.svg" alt="">
                            </button>
                            <nav id="dropdown-${user.id}" class="drop-down-menu bg-white dropper">
                                <button class="edit-Account" onclick="viewChange('user-listing-form', '${
                                  user.id
                                }')"><img class="svg-icon m-r" src="./icons/Edit+Account.svg" alt="edit"> Edit Account</button>
                                <button class="reset-password" onclick="resetPassword('${
                                  user.id
                                }')"><img class="svg-icon m-r" src="./icons/Reset+Password.svg" alt="reset"> Reset Password</button>
                                <button class="delete danger-text" onclick="confirmationMessage('${
                                  user.id
                                }')"><img class="svg-icon m-r" src="./icons/Delete.svg" alt="delete"> Delete</button>
                            </nav>
                        </td>
              </tr>`;
    });
  }
  $userListing.empty().append(renderListing);
}

// Check delete button enable or not each checkbox change
function isEnableDeleteButton() {
  let checkUser = userListing.filter(user => user.checked);
  const $btn = $("#delete-user-btn");

  if (checkUser.length) {
    $btn
      .find("span")
      .empty()
      .text(`(${checkUser.length})`);
    $btn.addClass("active");
  } else {
    $btn.removeClass("active");
  }
  $("#check-all").prop("checked", userListing.length && checkUser.length === userListing.length);
}

// drop-down menu toggle
function dropdownToggle(id) {
  const $ele = $(`#${id}`),
    isOpen = $ele.hasClass("active");

  if (!isOpen) $(".drop-down-menu").removeClass("active");

  $ele.toggleClass("active");
  dropDownMenuIsOpen = !isOpen;
}

// Confirmation message before delete user
function confirmationMessage(id) {
  deleteUserById = id;
  openModal(confirmationDeleteMessageModalContent);
}

// Delete single or multiple user account
function deleteUser() {
  let ids = [];
  if (deleteUserById) {
    ids = [deleteUserById];
  } else {
    let checkUser = userListing.filter(user => user.checked);
    ids = checkUser.map(user => user.id);
  }

  const promise = ids.map(id => app.DeleteUser(id));
  requestLoading("delete-account-loading", true);
  Promise.all(promise)
    .then(_ => {
      openModal(deleteSuccessModalContent);
      store.DeleteAccount(ids);
      pageChange(store.currentPage);
    })
    .catch(err => alertError(err))
    .finally(_ => {
      requestLoading("delete-account-loading", false);
      $("#delete-user-btn").removeClass("active");
    });
}

// Opened modal
function openModal(template) {
  const $modal = $("#modal-box");
  $modal
    .find("#modal-body")
    .html("")
    .html(template);
  $modal.addClass("active");
}

// Closed modal
function closeModal() {
  $("#modal-box").removeClass("active");
}

// Reset password
function resetPassword(id) {
  const user = userListing.find(user => user.id === id);
  if (!user) return;
  const template = resetPasswordModalContent(user);
  openModal(template);
}

// Reset password modal template
function resetPasswordModalContent(user) {
  return `  <img class="popup-icon" src="./icons/Reset+Password+Large.svg" alt=""/>
              <h3 class="modal-title m-t">Reset Password</h3>
              <p class="modal-text text-center">Send a password reset email to:<br>
                               <strong>${user.email}</strong>
              </p>
              <div>
                   <button class="primary-success-btn m-r" onclick="sendResetPassword('${user.email}')">
                      Yes, reset it!
                     <span id="reset-pass-loading" class="circle-loading hidden small m-l-h"><span></span></span>
                   </button>
                   <button class="primary-danger-btn" onclick="closeModal()">Cancel</button>
              </div>`;
}

// Send Reset password
function sendResetPassword(email) {
  requestLoading("reset-pass-loading", true);
  app
    .ForgetPassword(email)
    .then(_ => openModal(resetPasswordSuccessModalContent))
    .catch(err => alertError(err))
    .finally(_ => requestLoading("reset-pass-loading", false));
}

// Switch user listing and user form view
function viewChange(view, id) {
  editFormId = id;

  const currentView = view === "user-listing-content" ? "user-listing-form" : "user-listing-content",
    $currentView = $(`#${currentView}`),
    $changeView = $(`#${view}`);

  if (view === "user-listing-form") {
    if (id) {
      $email.prop("readonly", true);
      $password.prop("readonly", true);
      $password.val("**********");
      $changeView.addClass("edit-form");
      arragementFormFieldByUser();
    } else {
      $email.prop("readonly", false);
      $password.prop("readonly", false);
      $changeView.removeClass("edit-form");
      defaultFormFieldSet();
    }
  }

  $currentView
    .find(".animated-fade")
    .first()
    .removeClass("active");
  setTimeout(() => {
    $currentView.addClass("hidden");
    $changeView.removeClass("hidden");
    $changeView
      .find(".animated-fade")
      .first()
      .addClass("active");
  }, 500);
}

// Edit form fill by user information
function arragementFormFieldByUser() {
  if (!editFormId) {
    defaultFormFieldSet();
    return false;
  }

  const user = userListing.find(user => user.id === editFormId);
  if (!user) return false;

  $email.val(user.email);
  $member.val(user.member);
  $membership.val(user.member_ship);
  $firstName.val(user.first_name);
  $lastName.val(user.last_name);
  $phone.val(user.phone_no);
  $birthday.val(user.birthday);
  $address.val(user.address);
  $city.val(user.city);
  $state.val(user.state);
  $zipCode.val(user.zip_code);
}

// Reset default form
function defaultFormFieldSet() {
  $email.val("");
  $password.val("");
  $member.val("");
  $membership.val("");
  $firstName.val("");
  $lastName.val("");
  $phone.val("");
  $birthday.val("");
  $address.val("");
  $city.val("");
  $state.val("");
  $zipCode.val("");
}

// Delete user through form button
function removeUser() {
  confirmationMessage(editFormId);
}

// Form submit create and update user account
function formSubmit() {
  const payload = {
      email: $email.val(),
      member: $member.val(),
      member_ship: $membership.val(),
      first_name: $firstName.val(),
      last_name: $lastName.val(),
      phone_no: $phone.val(),
      birthday: $birthday.val(),
      address: $address.val(),
      city: $city.val(),
      state: $state.val(),
      zip_code: $zipCode.val(),
      created_at: new Date().toISOString(),
      full_name: `${($firstName.val() + " " + $lastName.val()).toLowerCase()}`
    },
    password = $password.val();

  requestLoading("request-loading", true);
  if (editFormId) {
    app
      .UpdateData(editFormId, payload)
      .then(res => {
        const index = userListing.findIndex(user => user.id === editFormId);
        if (userListing[index]) {
          userListing[index] = { ...userListing[index], ...payload };
          renderUserListing(userListing);
          store.UpdateAccount(userListing[index]);
        }
        openModal(accountSaveModalContent);
      })
      .catch(err => alertError(err))
      .finally(requestLoading("request-loading", false));
  } else {
    app
      .CreateUserAuthentication(payload.email, password)
      .then(res => {
        createUserOnFireBase(res.user.uid, payload);
      })
      .catch(err => {
        alertError(err);
        requestLoading("request-loading", false);
      });
  }
}

// updated User Success
function updateUserSuccess() {
  closeModal();
  viewChange("user-listing-content");
}

// Close modal re render user listing when delete and create user
function getUserListingAndCloseModel() {
  // getUserListing();
  closeModal();
  viewChange("user-listing-content");
}

// Create new user account
function createUserOnFireBase(userId, payload) {
  const data = { user_id: userId, ...payload };
  app
    .CreateUserData(data)
    .then(id => {
      store.CreateAccount(id, payload);
      openModal(accountCreatedModalContent);
      pageChange(store.currentPage);
    })
    .catch(err => alertError(err))
    .finally(_ => requestLoading("request-loading", false));
}

// Error handler and show error message
function alertError(error) {
  if (!error || !error.message) return;
  $errorMessage
    .find("p")
    .empty()
    .text(error.message);
  $errorMessage.addClass("active");
  setTimeout(() => {
    $errorMessage.removeClass("active");
  }, 2500);
}

// Searching user listing
let previousSearchText = "";
function searching() {
  const searchText = $search.val();
  if (searchText !== previousSearchText) {
    previousSearchText = searchText;
    store.Searching(searchText);
    pageChange(1);
  } else {
    previousSearchText = searchText;
  }
}

function requestLoading(id, bol) {
  const $ele = $(`#${id}`);
  bol ? $ele.removeClass("hidden") : $ele.addClass("hidden");
}

function nextPrevPage(bol) {
  const pageNo = bol ? store.currentPage + 1 : store.currentPage - 1;
  if (bol) {
    if (pageNo === +$(".last-link").text()) arrageNextPage(pageNo);
  } else if (pageNo === +$(".first-link").text()) {
    arragePrevPage(pageNo);
  }
  pageChange(pageNo);
}

function arrageNextPage(page) {
  const totalPages = previousSearchText ? store.searchTotalPage : store.totalPages;
  const nextPagesEnd = page + store.pagebtn - 1;
  const loopEnd = nextPagesEnd <= totalPages ? nextPagesEnd : totalPages;
  const pages = [];
  let loopStart = loopEnd - page === store.pagebtn - 1 ? page : loopEnd - (store.pagebtn - 1);
  loopStart = loopStart < 1 ? 1 : loopStart;
  for (let i = loopStart; i <= loopEnd; i++) {
    pages.push(i);
  }

  $("#pagination .page-no").each(function(index) {
    const id = pages[index];
    $(this)
      .text(id)
      .attr("id", `page-no-${id}`)
      .attr("data-id", `${id}`);
  });
}

function arragePrevPage(page) {
  const totalPages = previousSearchText ? store.searchTotalPage : store.totalPages;
  const nextPagesEnd = page + store.pagebtn - 1;
  let loopStart = page - (store.pagebtn - 1) < 1 ? 1 : page - (store.pagebtn - 1);
  loopStart = loopStart < 1 ? 1 : loopStart;
  const loopEnd = loopStart + (store.pagebtn - 1);
  const pages = [];

  for (let i = loopStart; i <= loopEnd; i++) {
    pages.push(i);
  }

  $("#pagination .page-no").each(function(index) {
    const id = pages[index];
    $(this)
      .text(id)
      .attr("id", `page-no-${id}`)
      .attr("data-id", `${id}`);
  });
}

function pageChange(pageNo) {
  store.currentPage = pageNo;
  const data = store.GetData(previousSearchText);
  const totalPages = previousSearchText ? store.searchTotalPage : store.totalPages;
  if (pageNo > 1) {
    $("#previous-page").prop("disabled", false);
  } else {
    $("#previous-page").prop("disabled", true);
  }
  if (pageNo === totalPages) {
    $("#next-page").prop("disabled", true);
  } else {
    $("#next-page").prop("disabled", false);
  }

  $(".page-no")
    .removeClass("active")
    .prop("disabled", false);
  $(`#page-no-${store.currentPage}`)
    .addClass("active")
    .prop("disabled", true);
  renderUserListing(data);
  isEnableDeleteButton();
}
