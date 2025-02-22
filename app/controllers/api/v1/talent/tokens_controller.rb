class API::V1::Talent::TokensController < ApplicationController
  after_action :notify_of_change

  def update
    if talent.id != current_user.talent.id
      return render json: {error: "You don't have access to perform that action"}, status: :unauthorized
    end
    was_deployed = token.deployed

    if token.update(token_params)
      if token.deployed? && !was_deployed
        CreateNotificationNewTalentListedJob.perform_later(talent.user_id)
      end
      CreateNotificationTalentChangedJob.perform_later(talent.user.followers.pluck(:follower_id), talent.user_id)
      render json: token, status: :ok
    else
      render json: {error: "Unable to update Token"}, status: :unprocessable_entity
    end
  end

  private

  def notify_of_change
    CreateNotificationTalentChangedJob.perform_later(talent.user.followers.pluck(:follower_id), talent.user_id)
  end

  def talent
    @talent ||=
      if talent_id_param
        Talent.find(params[:talent_id])
      else
        Talent.find_by!(public_key: params[:talent_id])
      end
  end

  def token
    @token ||= Token.find(params[:id])
  end

  def token_params
    params.require(:token).permit(
      :ticker,
      :contract_id,
      :deployed
    )
  end
end
