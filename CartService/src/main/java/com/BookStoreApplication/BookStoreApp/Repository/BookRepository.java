package com.BookStoreApplication.BookStoreApp.Repository;


import com.BookStoreApplication.BookStoreApp.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContaining(String title);
    List<Book> findByAuthorContaining(String author);
    List<Book> findByGenre(String genre);
    // Additional custom query methods can be added here
}