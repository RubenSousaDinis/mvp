class CreateNotificationTalentChangedJob < ApplicationJob
  queue_as :default

  def perform(users_ids, source_id)
    ActiveRecord::Base.transaction do
      service = CreateNotification.new
      name = User.find(source_id).display_name || User.find(source_id).username
      users_ids.each do |user_id|
        next if source_id == user_id

        service.call(
          title: 'Talent info updated',
          body: "#{name} profile has been updated",
          user_id: user_id,
          type: 'Notifications::TalentChanged',
          source_id: source_id
        )
      end
    rescue => e
      Rollbar.error(e, "Unable to create notification for new talent listed")

      raise ActiveRecord::Rollback.new(e)
    end
  end
end
