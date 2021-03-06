import React, { Component } from 'react'
import { search } from '../api/BooksAPI';
import BookCard from '../components/BookCard';
import _ from 'lodash'

export default class SearchPage extends Component {

    state={
        query: '',
        books: [],
        timeoutId: 0
    }

    handleQueryChange = (value) => {

        // using timeout to avoid overfetching by user typing
        clearTimeout(this.state.timeoutId);

        // to handle the controlled input component
        this.setState({ query: value }, () => {

            const timeoutId = setTimeout(() => {
                this.onSearchChange();
            }, 1000);

            this.setState({ timeoutId });
        });
    }

    onSearchChange = () => {
        if(this.state.query) {
            // make search request
            search(this.state.query)
                .then(res => {
                    // handle the case of empty search result
                    if(_.isArray(res)) {
                        res.length && this.setState({ books: [...res] })
                    } else {
                        this.setState({ books: [] })
                    }
                })
        }
    }

    getDifferenceBetweenCurrentAndNewBooks = () => {
        // because the searched books will not have shelf,
        // we will join the already categorized books with new ones
        // to recognize category
        const oldBooks = !this.state.books.length ? [] : _.mapKeys(this.props.books, 'id');
        const newBooks = _.mapKeys(this.state.books, 'id');

        // make Union between the two objects
        let joinedBooksObject = {...newBooks, ...oldBooks }

        // get the keys to iterate through them
        const joinedBooksIds = _.keys(joinedBooksObject);


        for(const bookId of joinedBooksIds) {
            // remove books that was added by the Union process,
            // that does not exist in the search query result
            // in short, we can say it's Intersect process.
            if(!_.has(newBooks, bookId)) {
                // omit return new object
                joinedBooksObject = _.omit(joinedBooksObject, bookId)
            }
        }

        // convert to an array for rendering
        const joinedBooks = Object.values(joinedBooksObject);

        return joinedBooks;
    }

    renderBooks = () => {
        const joinedBooks = this.getDifferenceBetweenCurrentAndNewBooks();

        return joinedBooks.map((book) => {
            book.shelf = !book.shelf ? 'none' : book.shelf; 
            return <BookCard key={book.id} book={book} onShelfChange={this.props.onShelfChange} />
        });
    }

    render() {
        return (
            <div className="search-page">
                <div className="search-block">
                    <form onSubmit={e => e.preventDefault()}>
                        <input 
                            name="search"
                            className="search-block__search-input"
                            placeholder="Search for a Book"
                            type="text" 
                            value={this.state.query} 
                            onChange={(e) => this.handleQueryChange(e.target.value)} 
                        />
                    </form>
                </div>
                <div className="books-container">
                    {this.renderBooks()}
                </div>
            </div>
        )
    }
}
