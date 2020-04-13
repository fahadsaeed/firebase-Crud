class DataStore {
  constructor() {
    this.init();
  }

  init() {
    this.currentPage = 1;
    this.limit = 10;
    this.pagebtn = 5;
    this.initialLoadDataLimit = this.pagebtn * this.limit;
    this.total = 0;
    this.totalPages = 0;
    this.data = [];
    this.searchData = [];
    this.searchTotal = 0;
    this.searchTotalPage = 0;
    this.app = new Firebase();
  }

  initialLoadData() {
    return new Promise((resolve, reject) => {
      this.app
        .init()
        .then(_ => {
          this.app.firebaseInit();
        })
        .then(_ => {
          this.app
            .UserListing(this.initialLoadDataLimit)
            .then(res => {
              this.data = this.data.concat(res);
              this.total = this.data.length;
              this.totalPages = Math.ceil(this.total / this.limit);
              resolve(res.slice(0, this.limit));
            })
            .catch(err => reject(err))
            .finally(_ => this.Pagination());
        })
        .catch(err => reject(err));
    });
  }

  GetDataOnServer() {
    this.app.UserListing(0).then(res => {
      this.data = this.data.concat(res);
      this.total = this.data.length;
      this.totalPages = Math.ceil(this.total / this.limit);
    });
  }

  Pagination(startPage, search) {
    let pages = "",
      totalPages = search ? this.searchTotalPage : this.totalPages,
      total = search ? this.searchTotal : this.total,
      startIndex = startPage || 1,
      endPages = startIndex + (this.pagebtn - 1),
      loopEnds = endPages <= totalPages ? endPages : totalPages;
    if (total && total > this.limit) {
      pages += `<nav class="p">
                        <ul class="pagination flex-s-center">
                            <li class="page-item">
                                <button id="previous-page" class="page-link flex-center" disabled onclick="nextPrevPage()">
                                    <span aria-hidden="true"><img class="page-arrow rotate" src="https://s3.amazonaws.com/koderlabs.com/lda/PaginationNext.svg" alt=""></span>
                                </button>
                            </li>`;

      for (let i = startIndex; i <= loopEnds; i++) {
        pages += `<li class="page-item"><button id="page-no-${i}" class="page-no page-link flex-center ${
          i === loopEnds ? "last-link" : ""
        } ${i === this.currentPage ? "active" : ""}  ${i === startIndex ? "first-link" : ""}" data-id="${i}" >${i}</button></li>`;
      }

      pages += `<li class="page-item flex-center">
                                <button id="next-page" class="page-link" onclick="nextPrevPage(true)">
                                    <span aria-hidden="true"><img class="page-arrow" src="https://s3.amazonaws.com/koderlabs.com/lda/PaginationNext.svg" alt=""></span>
                                </button>
                            </li>
                        </ul>
                    </nav> `;
    }
    $("#pagination")
      .empty()
      .append(pages);
  }

  GetData(serach) {
    const page = this.currentPage,
      data = serach ? this.searchData : this.data,
      totalPages = serach ? this.searchTotalPage : this.totalPages,
      total = serach ? this.searchTotal : this.total,
      startIndex = (page - 1) * this.limit,
      endIndex = page === totalPages ? total : page * this.limit;
    return data.slice(startIndex, endIndex);
  }

  UpdateAccount(account) {
    const index = this.data.findIndex(data => data.id === account.id);
    if (this.data[index]) {
      this.data[index] = { ...this.data[index], ...account };
    }
  }

  CreateAccount(id, account) {
    this.data.unshift({ id: id, ...account });
    this.reRenderPagination();
  }

  DeleteAccount(ids) {
    ids.forEach(id => {
      const index = this.data.findIndex(account => account.id === id);
      if (index || index === 0) this.data.splice(index, 1);
    });

    this.reRenderPagination("deleteAccount");
  }

  Searching(text) {
    if (text && this.data.length) {
      this.searchData = this.data.filter(data => {
        const textSearch = text.toLowerCase();
        if (
          data.full_name.toLowerCase().includes(textSearch) ||
          data.email.toLowerCase().includes(textSearch) ||
          data.member.toLowerCase().includes(textSearch)
        ) {
          return data;
        }
      });

      this.searchTotal = this.searchData.length;
      this.searchTotalPage = Math.ceil(this.searchTotal / this.limit);
    }
    this.Pagination(1, text);
  }

  reRenderPagination(deleteAccount) {
    this.total = this.data.length;
    const currentTotalPages = Math.ceil(this.total / this.limit);
    if (this.totalPages !== currentTotalPages) {
      let startIndex = 1;
      if (this.total >= this.pagebtn * this.limit) {
        startIndex = currentTotalPages - (this.pagebtn - 1);
      }
      if (this.totalPages === this.currentPage) {
        this.currentPage = deleteAccount ? currentTotalPages : this.currentPage;
        startIndex = currentTotalPages - (this.pagebtn - 1);
      }

      this.totalPages = currentTotalPages;
      this.Pagination(startIndex);
    }
  }
}
