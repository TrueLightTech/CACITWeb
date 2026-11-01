<template>
  <div>
    <div class="ds-page-head">
      <div class="ds-page-head__copy">
        <h1 class="ds-h1">People with access</h1>
        <p>Everyone who can do more than a member can. Search to give someone else access.</p>
      </div>
      <div class="ds-page-head__actions">
        <NuxtLink class="ds-btn ds-btn--secondary" to="/admin/access/roles">Roles</NuxtLink>
      </div>
    </div>

    <div class="ds-tablewrap">
      <div class="ds-toolbar">
        <div class="ds-toolbar__search ds-search">
          <svg class="ds-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            class="ds-input"
            type="search"
            aria-label="Search all members by name or phone number"
            placeholder="Search all members by name or phone"
            @input="onSearch"
          >
          <button v-if="search" class="ds-search__clear" type="button" aria-label="Clear search" @click="clearSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="ds-field" style="margin-bottom:0;min-width:180px">
          <label class="ds-label" for="accessRole">Role</label>
          <select id="accessRole" v-model="roleId" class="ds-select" @change="load(1)">
            <option value="">Any role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>

        <div class="ds-field" style="margin-bottom:0;min-width:220px">
          <label class="ds-label" for="accessPermission">Can</label>
          <select id="accessPermission" v-model="permission" class="ds-select" @change="load(1)">
            <option value="">Do anything</option>
            <optgroup v-for="module in catalogue" :key="module.key" :label="module.label">
              <option v-for="item in module.permissions" :key="item.code" :value="item.code">{{ item.label }}</option>
            </optgroup>
          </select>
        </div>

        <div class="ds-toolbar__right">
          <span class="ds-toolbar__count">{{ countLabel }}</span>
        </div>
      </div>

      <div v-if="error" class="ds-errorstate">
        <h3 class="ds-h3">Could not load people</h3>
        <p>{{ error }}</p>
        <button class="ds-btn ds-btn--secondary ds-btn--sm" type="button" @click="load(paging.page)">Try again</button>
      </div>

      <div v-else-if="isLoading" class="ds-tablescroll">
        <table class="ds-table">
          <tbody>
            <tr v-for="row in 6" :key="row">
              <td><span class="ds-skeleton" :style="{ width: (110 + (row % 3) * 30) + 'px' }"></span></td>
              <td><span class="ds-skeleton ds-skeleton--pill"></span></td>
              <td><span class="ds-skeleton" style="width:90px"></span></td>
              <td><span class="ds-skeleton" style="width:40px"></span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!rows.length" class="ds-empty">
        <h3 class="ds-h3">{{ isFiltered ? 'Nobody matches' : 'Nobody has extra access yet' }}</h3>
        <p v-if="isFiltered">Check the spelling, or clear the filters.</p>
        <p v-else>Search for a member to give them a role or a single permission.</p>
      </div>

      <div v-else class="ds-tablescroll">
        <table class="ds-table ds-table--cards">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Church family</th>
              <th class="ds-col-num">Extra grants</th>
              <th>Sensitive access</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in rows" :key="person.userId" class="access__row" @click="open(person)">
              <td data-label="Name">
                <NuxtLink class="ds-table__primary" :to="`/admin/access/people/${person.userId}`" @click.native.stop>
                  {{ person.name || 'Unnamed member' }}
                </NuxtLink>
                <div v-if="person.phoneNumber" class="ds-meta ds-num">{{ person.phoneNumber }}</div>
              </td>
              <td data-label="Role">
                <span class="ds-badge" :class="person.fullAccess ? 'ds-badge--info' : 'ds-badge--neutral'">
                  {{ person.roleName || 'Member' }}
                </span>
              </td>
              <td data-label="Church family" class="ds-muted">{{ person.familyName || 'Not assigned' }}</td>
              <td data-label="Extra grants" class="ds-col-num">{{ person.grantCount || 0 }}</td>
              <td data-label="Sensitive access">
                <span v-if="person.fullAccess" class="ds-badge ds-badge--warning">Full access</span>
                <template v-else-if="(person.sensitive || []).length">
                  <span
                    v-for="code in person.sensitive.slice(0, 3)"
                    :key="code"
                    class="ds-badge ds-badge--warning access__badge"
                  >{{ label(code) }}</span>
                  <span v-if="person.sensitive.length > 3" class="ds-meta">+{{ person.sensitive.length - 3 }} more</span>
                </template>
                <span v-else class="ds-meta">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!isLoading && !error && paging.totalPages > 1" class="ds-pagination">
        <span class="ds-pagination__summary">Page <b>{{ paging.page }}</b> of <b>{{ paging.totalPages }}</b></span>
        <div class="ds-pagination__controls">
          <button class="ds-page" type="button" :disabled="paging.page <= 1" @click="load(paging.page - 1)">Previous</button>
          <button class="ds-page" type="button" :disabled="paging.page >= paging.totalPages" @click="load(paging.page + 1)">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { rowsOf, pagingOf, payload, errorMessage } from '../../../network/MobileApp'
import { indexCatalogue, permissionLabel } from '../../../network/Access'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 350

/**
 * Who can do what.
 *
 * With no search the API lists only people with access — any role but
 * Member, or a grant of their own. A search covers every approved member, so
 * this is also where someone new is given access.
 */
export default {
  name: 'access-people',
  data () {
    return {
      rows: [],
      paging: { page: 1, totalPages: 0, totalCount: 0 },
      roles: [],
      catalogue: [],
      search: '',
      roleId: this.$route.query.roleId || '',
      permission: '',
      isLoading: false,
      error: '',
      searchTimer: null
    }
  },
  computed: {
    catalogueIndex () {
      return indexCatalogue(this.catalogue)
    },
    isFiltered () {
      return !!(this.search.trim() || this.roleId || this.permission)
    },
    countLabel () {
      if (this.isLoading) { return 'Loading…' }
      const count = this.paging.totalCount
      return count === 1 ? '1 person' : `${count} people`
    }
  },
  beforeMount () {
    this.load(1)
    this.loadFilters()
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  },
  methods: {
    label (code) {
      return permissionLabel(this.catalogueIndex, code)
    },
    open (person) {
      this.$router.push(`/admin/access/people/${person.userId}`)
    },
    onSearch () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.load(1), SEARCH_DEBOUNCE_MS)
    },
    clearSearch () {
      clearTimeout(this.searchTimer)
      this.search = ''
      this.load(1)
    },
    loadFilters () {
      this.$axios.get('admin/access/roles').then(response => {
        this.roles = payload(response) || []
      }).catch(() => { this.roles = [] })

      this.$axios.get('admin/access/catalogue').then(response => {
        this.catalogue = payload(response) || []
      }).catch(() => { this.catalogue = [] })
    },
    load (page) {
      this.isLoading = true
      this.error = ''

      this.$axios.get('admin/access/people', {
        params: {
          search: this.search.trim() || undefined,
          roleId: this.roleId || undefined,
          permission: this.permission || undefined,
          page,
          pageSize: PAGE_SIZE
        }
      }).then(response => {
        this.rows = rowsOf(response)
        this.paging = pagingOf(response, page)
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        this.rows = []
        this.error = errorMessage(error, 'The church server did not respond. Nothing was changed.')
      })
    }
  }
}
</script>

<style scoped>
.access__row { cursor: pointer; }
.access__row:hover { background: var(--ds-surface-2); }
.access__badge { margin: 0 4px 4px 0; }
</style>
