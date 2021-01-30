(() => {
  /**
   * Creates App title
   * @param {string} title
   * @returns {HTMLHeadingElement}
   */
  function createAppTitle(title) {
    const appTitle = document.createElement('h2');

    appTitle.innerHTML = title;
    return appTitle;
  }

  /**
   * Creates To-Do Form
   * @returns {{button: HTMLButtonElement, input: HTMLInputElement, form: HTMLFormElement}}
   */
  function createTodoItemForm() {
    const form = document.createElement('form');
    const input = document.createElement('input');
    const buttonWrapper = document.createElement('div');
    const button = document.createElement('button');

    // Styling elements
    form.classList.add('input-group', 'my-3');

    input.classList.add('form-control');
    input.placeholder = 'Add a task';

    buttonWrapper.classList.add('input-group-append');
    button.classList.add('btn', 'btn-primary');
    button.disabled = true;
    button.textContent = 'Add';

    // Appending elements
    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button,
    };
  }

  /**
   * Create list of todos
   * @returns {HTMLUListElement}
   */
  function createTodoList() {
    const list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  }

  /**
   * Create to-do item
   * @param {Object} todoItem
   * @param {callback} onDone
   * @param {callback} onDelete
   * @returns {HTMLLIElement}
   */
  function createTodoItem(todoItem, { onDone, onDelete }) {
    const doneClass = 'list-group-item-success';

    const item = document.createElement('li');
    const buttonGroup = document.createElement('div');
    const doneButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    // Styling to-do items
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    item.textContent = todoItem.name;

    // Styling buttons
    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Done';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Delete';

    // Appending elements
    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);
    if (todoItem.done) item.classList.add(doneClass);

    // Adding event listeners to the buttons (done and delete)
    doneButton.addEventListener('click', async () => {
      onDone({ todoItem });
      item.classList.toggle(doneClass, todoItem.done);
    });

    deleteButton.addEventListener('click', async () => {
      onDelete({ todoItem, element: item });
    });

    return item;
  }

  /**
   * Create To-Do app
   * @param {string} host
   * @param {string} owner
   * @param {string} title
   * @param {HTMLElement} container
   */
  async function createTodoApp({
    container,
    host,
    owner,
    title,
  }) {
    const todoAppTitle = createAppTitle(title);
    const todoItemForm = createTodoItemForm();
    const todoList = createTodoList();

    const response = await fetch(`${host}?owner=${owner}`);
    const todoItemsList = await response.json();

    const handlers = {
      onDone({ todoItem }) {
        todoItem.done = !todoItem.done;
        fetch(`${host}${todoItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: todoItem.done }),
        });
      },
      onDelete({ todoItem, element }) {
        if (!confirm('Вы уверены?')) return;
        element.remove();
        fetch(`${host}${todoItem.id}`, { method: 'DELETE' });
      },
    };

    // Getting 'todos' from server
    todoItemsList.forEach((todoItem) => {
      const todoItemElement = createTodoItem(todoItem, handlers);
      todoList.append(todoItemElement);
    });

    // Appending elements
    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    // Disable adding btn, if input is empty
    todoItemForm.input.addEventListener('input', () => {
      todoItemForm.button.disabled = !todoItemForm.input.value;
    });

    // Adding element on submit
    todoItemForm.form.addEventListener('submit', async (e) => {
      // Disable default action
      e.preventDefault();
      const { value } = todoItemForm.input;
      const res = await fetch(`${host}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: value,
          owner,
        }),
      });

      const todoItem = await res.json();
      const todoItemElement = createTodoItem(todoItem, handlers);
      todoList.append(todoItemElement);

      // Clear input
      todoItemForm.input.value = '';
      todoItemForm.button.disabled = true;
    });
  }

  // Make function global
  window.createTodoApp = createTodoApp;
})();
