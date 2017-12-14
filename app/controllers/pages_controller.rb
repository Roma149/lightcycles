class PagesController < ApplicationController

	before_filter :signed_in_user

	def home

	end

	def scoreboard
		@users = User.all
	end

	private

	def signed_in_user
		redirect_to '/login' unless signed_in?
	end
end
