require File.expand_path(File.dirname(__FILE__) + '/acceptance_helper')

feature "Todos" do

  scenario "Empty List", :js => true do
    visit '/'

    within('.todos') do
      page.should have_content('No Todos')
    end
  end
end
