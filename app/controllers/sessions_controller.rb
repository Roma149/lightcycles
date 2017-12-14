class SessionsController < ApplicationController
	
	def new
		@user = User.new
	end

	# sign the user in
	def create
		user = User.find_by(username: params[:user][:username])

		if user && user.authenticate(params[:user][:password])
			sign_in user
			redirect_to root_url, notice: "Welcome back!"
		else
			flash.now[:error] = "There was an error!"
			redirect_to "/login"
		end
	end

	def destroy
		sign_out
		redirect_to "/login", notice: "Fine! But those lightcycles aren't gonna destroy themselves!"
	end

	private

	def session_params
		params[:user].permit(:username, :password)
	end

end
