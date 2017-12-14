class UsersController < ApplicationController

	# action to return a form to register (create a new user)
	def new
		@user = User.new
	end

	# action to create the new user
	def create
		@user = User.new(user_params)
	    if @user.save
	      sign_in @user
	      flash[:success] = "Congratulations! You are now registered and can start playing Lightcycles."
	      redirect_to root_path
	    end
	end

	# action to delete the current user
	def destroy
		current_user.destroy
		sign_out
	    flash[:success] = "The user was successfully deleted. WHYYYY?????? :'("
	    redirect_to root_path
	end

	# sign the user in as a guest
	def guest
		id = User.count + 1
		@user = User.new(username: "Guest_#{id}", password: "guestpass#{id}", password_confirmation: "guestpass#{id}")
		if @user.save!
			sign_in @user
			flash[:success] = "Welcome to Lightcycles!"
			redirect_to root_path
		else
			flash[:error] = "Sorry, there was an error!"
			redirect_to "/login"
		end
	end

	def update_stats
		respond_to do |format|
			format.js do
				if params[:wins] == "1" then current_user.add_win end
				if params[:losses] == "1" then current_user.add_loss end
				if params[:draws] == "1" then current_user.add_draw end
				current_user.save(validate: false)
				sign_in current_user
				render nothing: true
			end
		end
	end

	private

    def user_params
      params[:user].permit(:username, :password, :password_confirmation)
    end

end
