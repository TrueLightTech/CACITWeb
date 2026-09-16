<template>
  <div>
    <div v-if="pageRefresh" class="ds-card" style="max-width:760px">
      <span class="ds-skeleton" style="height:300px;border-radius:6px 6px 0 0;display:block"></span>
      <div class="ds-card__body" style="display:grid;gap:12px">
        <span class="ds-skeleton" style="height:20px;width:55%"></span>
        <span class="ds-skeleton" style="height:12px;width:30%"></span>
        <span class="ds-skeleton" style="height:12px"></span>
        <span class="ds-skeleton" style="height:12px;width:85%"></span>
      </div>
    </div>

    <template v-else>
      <div class="ds-page-head">
        <div class="ds-page-head__copy">
          <h1 class="ds-h1">{{ announcement.title }}</h1>
          <p>
            <time :datetime="announcement.createdAt">
              Published {{ $moment(announcement.createdAt).format('D MMMM YYYY') }}
            </time>
          </p>
        </div>

        <div v-if="isChurchManager" class="ds-page-head__actions">
          <NuxtLink class="ds-btn ds-btn--secondary" :to="`/admin/announcements/${announcement.id}/edit`">
            Edit
          </NuxtLink>
          <button class="ds-btn ds-btn--danger" type="button" @click="confirmOpen = true">
            Delete
          </button>
        </div>
      </div>

      <article class="ds-card" style="max-width:760px;overflow:hidden">
        <img :src="getAnnouncementImage(announcement.image)" alt="" class="announcement__image">
        <div class="ds-card__body">
          <p class="announcement__body">{{ announcement.body }}</p>
        </div>
      </article>
    </template>

    <ConfirmDialog
      :open="confirmOpen"
      :busy="isDeleting"
      title="Delete this announcement?"
      :message="`&quot;${announcement.title}&quot; will be removed from every member's dashboard. This cannot be undone.`"
      confirm-label="Delete announcement"
      @cancel="confirmOpen = false"
      @confirm="deleteAnnouncement"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Announcement } from '../../../../network/Announcement'
import { profileImageBaseUrl } from '../../../../resources/constants'
import { ROLE_CHURCH_MANAGER } from '../../../../resources/navigation'
import ConfirmDialog from '../../../../components/ConfirmDialog'

export default {
  name: 'announcement-detail',
  components: { ConfirmDialog },
  data () {
    return {
      pageRefresh: false,
      isDeleting: false,
      confirmOpen: false,
      announcement: Announcement
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
    isChurchManager () {
      return this.loggedInUser && this.loggedInUser.data &&
        this.loggedInUser.data.roleId === ROLE_CHURCH_MANAGER
    }
  },
  beforeMount () {
    this.getAnnouncement(this.$route.params.id)
  },
  methods: {
    getAnnouncement (id) {
      this.pageRefresh = true
      this.$axios.get(`announcements/${id}`).then(response => {
        this.announcement = Object.assign({}, Announcement, response.data.data)
        this.pageRefresh = false
      }).catch(() => {
        this.pageRefresh = false
      })
    },
    getAnnouncementImage (image) {
      if (image) {
        return `${profileImageBaseUrl}/${image}`
      }
      return require('~/assets/imgs/no_image.png')
    },
    deleteAnnouncement () {
      this.isDeleting = true
      this.$axios.delete(`announcements/${this.announcement.id}`).then(() => {
        this.isDeleting = false
        this.confirmOpen = false
        this.$toast.success('Announcement deleted')
        this.$router.push('/admin/announcements')
      }).catch(error => {
        this.isDeleting = false
        this.confirmOpen = false
        const message = error && error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Could not delete this announcement.'
        this.$toast.error(message)
      })
    }
  }
}
</script>

<style scoped>
.announcement__image {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  background: var(--ds-surface-2);
  border-bottom: 1px solid var(--ds-border);
  display: block;
}

.announcement__body {
  margin: 0;
  font-size: var(--ds-text-md);
  line-height: 1.65;
  white-space: pre-line;
  overflow-wrap: anywhere;
  max-width: 68ch;
}
</style>
